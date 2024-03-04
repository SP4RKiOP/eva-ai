using Microsoft.AspNetCore.Mvc;
using genai.backend.api.Services;

namespace genai.backend.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        [HttpPost("UserId")]
        public IActionResult GetOrCreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.EmailId))
            {
                return BadRequest("EmailId is required.");
            }

            string userId = _userService.GetOrCreateUser(request.EmailId, request.FirstName, request.LastName);
            return Ok(userId);
        }
    }

    public class CreateUserRequest
    {
        public string EmailId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
