using Microsoft.AspNetCore.Mvc;
using genai.backend.api.Services;

namespace genai.backend.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly SemanticService _semanticService;

        public UsersController(UserService userService, SemanticService semanticService)
        {
            _userService = userService;
            _semanticService = semanticService;

        }

        [HttpPost("UserId")]
        public async Task<IActionResult> GetOrCreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.EmailId))
            {
                return BadRequest("EmailId is required.");
            }

            string userId = _userService.GetOrCreateUser(request.EmailId, request.FirstName, request.LastName);
            await _semanticService.GetChatTitlesForUser(userId:userId);
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
