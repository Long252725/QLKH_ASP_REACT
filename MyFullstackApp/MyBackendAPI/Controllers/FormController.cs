using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;

namespace MyBackendAPI.Controllers;


[ApiController] // Đánh dấu đây là một API Controller
[Route("api/[controller]")] // Route sẽ tự động lấy tên đứng trước chữ Controller (ở đây là 'api/data')

public class FormController : ControllerBase
{
    private readonly IMongoCollection<CustomerModel> _customerCollection;

    public FormController(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _customerCollection = database.GetCollection<CustomerModel>("Customers");
    }
    [HttpPost("add")]
    public async Task<IActionResult> AddCustomer([FromBody] CustomerModel customer)
    {
        try {
            // Lưu vào MongoDB
            await _customerCollection.InsertOneAsync(customer);
            
            return Ok(new { success = true, message = "Đã lưu vào MongoDB thành công!" });
        }
        catch (Exception ex) {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    [HttpPost("search")]
public async Task<IActionResult> SearchCustomers([FromBody] SearchRequest request)
{
    try
    {
        // 1. Khởi tạo filter trống (mặc định lấy tất cả)
        var builder = Builders<CustomerModel>.Filter;
        var filter = builder.Empty;
        Console.WriteLine($"Search Request: {request}");

        // 2. Lọc theo Tên (Regex) nếu có
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            filter &= builder.Regex(c => c.HoTenDayDu, new BsonRegularExpression(request.Name, "i"));
        }

        // 3. Lọc theo Giới tính (khớp chính xác)
        if (!string.IsNullOrWhiteSpace(request.Gender))
        {
            filter &= builder.Eq("Gender", request.Gender); // "GioiTinh" là tên field trong DB
        }

        // 4. Lọc theo Quê quán
        if (!string.IsNullOrWhiteSpace(request.ProvinceId))
        {
            filter &= builder.Eq("ProvinceId", request.ProvinceId); 
        }

        // 5. Lọc theo Ngày sinh
        if (!string.IsNullOrWhiteSpace(request.Dob))
        {
            filter &= builder.Eq("DateOfBirth", request.Dob);
        }

        // 6. Thực thi truy vấn với Phân trang
        var totalCustomers = await _customerCollection.CountDocumentsAsync(filter);
        
        var results = await _customerCollection
            .Find(filter)
            .Skip((request.Page - 1) * request.PageSize)
            .Limit(request.PageSize)
            .ToListAsync();

        return Ok(new
        {
            total = totalCustomers,
            page = request.Page,
            pageSize = request.PageSize,
            totalPages = (int)Math.Ceiling((double)totalCustomers / request.PageSize),
            data = results
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    [HttpGet("list")]
    public async Task<IActionResult> GetPagedCustomers(int page = 1, int pageSize = 10)
{
    try
    {
        // 1. Đếm tổng số lượng khách hàng để React biết có bao nhiêu trang
        long totalCustomers = await _customerCollection.CountDocumentsAsync(_ => true);

        // 2. Lấy dữ liệu theo trang
        var customers = await _customerCollection.Find(_ => true)
            .Skip((page - 1) * pageSize) // Bỏ qua các mục của trang trước
            .Limit(pageSize)              // Chỉ lấy đúng số lượng pageSize
            .ToListAsync();

        return Ok(new
        {
            total = totalCustomers,
            page = page,
            pageSize = pageSize,
            totalPages = (int)Math.Ceiling((double)totalCustomers / pageSize),
            data = customers
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
    [HttpPost("delete")]
    public async Task<IActionResult> DeleteMultipleCustomers([FromBody] List<string> ids)
{
    try
    {
        if (ids == null || ids.Count == 0)
        {
            return BadRequest(new { success = false, message = "Danh sách ID trống!" });
        }

        // Sử dụng Filter.In để tìm tất cả các bản ghi có ID nằm trong mảng gửi lên
        var filter = Builders<CustomerModel>.Filter.In(c => c.Id, ids);
        var result = await _customerCollection.DeleteManyAsync(filter);

        return Ok(new { 
            success = true, 
            message = $"Đã xóa thành công {result.DeletedCount} mục!",
            count = result.DeletedCount 
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = ex.Message });
    }
}
[HttpGet("edit/{id}")]
    public async Task<IActionResult> GetCustomerById(string id)
{
    try
    {
        // 1. Tìm khách hàng theo Id
        // MongoDB Driver sẽ tự chuyển chuỗi 'id' thành ObjectId nếu bạn cấu hình Model đúng
        var customer = await _customerCollection.Find(c => c.Id == id).FirstOrDefaultAsync();

        // 2. Kiểm tra xem có thấy khách hàng không
        if (customer == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy khách hàng này!" });
        }

        // 3. Trả về object khách hàng
        return Ok(customer);
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = "Lỗi: " + ex.Message });
    }
}
[HttpPut("updated")]
public async Task<IActionResult> UpdateCustomer([FromBody] CustomerModel updatedCustomer)
{
    try
    {
        // 1. Kiểm tra ID có hợp lệ không
        if (string.IsNullOrEmpty(updatedCustomer.Id))
        {
            return BadRequest(new { success = false, message = "ID khách hàng không hợp lệ!" });
        }

        // 2. Tạo bộ lọc theo ID
        var filter = Builders<CustomerModel>.Filter.Eq(c => c.Id, updatedCustomer.Id);

        // 3. Thực hiện thay đổi dữ liệu trong MongoDB
        // ReplaceOneAsync sẽ ghi đè toàn bộ dữ liệu mới vào Document có ID trùng khớp
        var result = await _customerCollection.ReplaceOneAsync(filter, updatedCustomer);

        if (result.MatchedCount == 0)
        {
            return NotFound(new { success = false, message = "Không tìm thấy khách hàng để cập nhật!" });
        }

        return Ok(new { success = true, message = "Cập nhật thông tin thành công!" });
    }
    catch (Exception ex)
    {
        return BadRequest(new { success = false, message = "Lỗi hệ thống: " + ex.Message });
    }
}
}
// 1. Khai báo cái khuôn để nhận dữ liệu
public class CustomerModel
{
    [MongoDB.Bson.Serialization.Attributes.BsonId]
    [MongoDB.Bson.Serialization.Attributes.BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string? Id { get; set; }
    public string Ho { get; set; }
    public string Ten { get; set; }
    public string TenDem { get; set; }
    public string HoTenDayDu { get; set; }
    public string Email { get; set; }
    public string Sdt { get; set; }
    public string DateOfBirth { get; set; }
    public string Gender { get; set; }
    public string Province { get; set; }
    public string District { get; set; }
    public string Ward { get; set; }
    public string ProvinceId { get; set; }
    public string DistrictId { get; set; }
    public string WardId { get; set; }
}
public class SearchRequest
{
    public string Name { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    
    // Thêm các trường lọc bổ sung
    public string? Gender { get; set; }
    public string? ProvinceId { get; set; }
    public string? Dob { get; set; } 

}