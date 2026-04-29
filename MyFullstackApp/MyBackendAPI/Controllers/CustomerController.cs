using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerController(ICustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    [HttpGet("search")]
    public IActionResult Search(
        string? keyword, 
        string? province, 
        string? sortBy, 
        string? gender, 
        string? dobFrom, 
        string? dobTo,
        int page = 1, 
        int pageSize = 10)
    {
        try
        {
            var results = _customerRepository.Search(keyword, province, sortBy, gender, dobFrom, dobTo, page, pageSize);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("add")]
    public IActionResult Add([FromBody] CustomerModel customer)
    {
        try
        {
            var newCustomer = _customerRepository.Add(customer);
            return Ok(new { success = true, message = "Thêm khách hàng thành công!", data = newCustomer });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    [HttpPost("delete")]
    public IActionResult DeleteMany([FromBody] List<string> ids)
    {
       try
        {
            return Ok(_customerRepository.DeleteMany(ids));
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    [HttpGet("edit/{id}")]
    public IActionResult Edit(string id)
    {
        try
        {
            var customer = _customerRepository.GetCustomerById(id);
            if (customer == null)
            {
                return NotFound(new { success = false, message = "Khách hàng không tồn tại!" });
            }
            return Ok(customer);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
    [HttpPut("updated")]
    public IActionResult Update([FromBody] CustomerModel customer)
    {
        try
        {
            var updatedCustomer = _customerRepository.Update(customer);
            if (updatedCustomer == null)
            {
                return NotFound(new { success = false, message = "Khách hàng không tồn tại!" });
            }
            return Ok(new { success = true, message = "Cập nhật thành công!", data = updatedCustomer });
        } catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
    }
    [HttpPost("upload")]
    public async Task<IActionResult> ImportExcel([FromForm] IFormFile file)
    {
        try
        {
            var result = await _customerRepository.ImportExcel(file);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}