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

            string uId = _userService.GetOrCreateUser(request.EmailId, request.FirstName, request.LastName);
            await _userService.GetChatTitlesForUser(userId:uId);
            await _userService.GetAvailableModels(userId:uId);
            return Ok(uId);
        }
    }

    public class CreateUserRequest
    {
        public string EmailId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
