using Microsoft.AspNetCore.Mvc;

namespace MyBackendAPI.Controllers;

[ApiController] // Đánh dấu đây là một API Controller
[Route("api/[controller]")] // Route sẽ tự động lấy tên đứng trước chữ Controller (ở đây là 'api/data')
public class DataController : ControllerBase
{
    [HttpGet] // Định nghĩa đây là phương thức GET
    public IActionResult GetData()
    {
        return Ok(new { message = "Hello!" });
    }

    [HttpGet("test")] // Route sẽ là: api/data/test
    public IActionResult GetTest()
    {
        return Ok("Bạn vừa gọi hàm test");
    }
}