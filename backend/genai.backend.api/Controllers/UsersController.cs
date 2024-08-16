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

            try
            {
                string uId = await _userService.GetCreateUser(request.EmailId, request.FirstName, request.LastName);
                return Ok(uId);
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("StreamUserData")]
        public async Task<IActionResult> StreamUserData([FromBody] UserStreamRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("UserId is required.");
            }

            try
            {
                await _userService.GetChatTitlesForUser(request.UserId);
                await _userService.GetAvailableModels(userId: request.UserId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class CreateUserRequest
    {
        public string EmailId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
    public class UserStreamRequest
    {
        public string UserId { get; set; }
    }
}
