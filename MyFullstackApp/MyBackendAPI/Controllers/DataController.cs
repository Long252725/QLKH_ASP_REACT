using Microsoft.AspNetCore.Mvc;

namespace MyBackendAPI.Controllers;

[ApiController] // Đánh dấu đây là một API Controller
[Route("api/[controller]")] // Route sẽ tự động lấy tên đứng trước chữ Controller (ở đây là 'api/data')
public class DataController : ControllerBase
{
    [HttpGet] // Định nghĩa đây là phương thức GET
    public IActionResult GetData()
    {
        var result = new { Message = "Hello từ Controller xịn xò!" };
        return Ok(result); // Trả về Status Code 200 và dữ liệu JSON
    }

    [HttpGet("test")] // Route sẽ là: api/data/test
    public IActionResult GetTest()
    {
        return Ok("Bạn vừa gọi hàm test");
    }
}