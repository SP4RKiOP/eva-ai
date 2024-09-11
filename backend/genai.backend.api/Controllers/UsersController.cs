using Microsoft.AspNetCore.Mvc;
using genai.backend.api.Services;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using genai.backend.api.Middlewares;

namespace genai.backend.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [RateLimit(requestsPerMinute: 60)]
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
        [AllowAnonymous]
        public async Task<IActionResult> GetOrCreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.EmailId))
            {
                return BadRequest("EmailId is required.");
            }

            try
            {
                dynamic uId_token = await _userService.GetCreateUser(request.EmailId.ToLower(), request.FirstName, request.LastName, request.Partner);
                HttpContext.Response.Headers.Add("Authorization", uId_token.Token);
                return Ok(uId_token.UserId.ToString());
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            try
            {
                var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;
                if (userId!=null)
                {
                    var conversations = await _userService.Conversations(Guid.Parse(userId));
                    return Ok(conversations);
                }
                return BadRequest();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            try
            {
                var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;
                if (userId != null)
                {
                    var models = await _userService.GetSubscribedModels(userId: Guid.Parse(userId));
                    return Ok(models);
                }
                return BadRequest();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("conversation/{chatId:guid}")]
        public async Task<IActionResult> GetConvHistory(Guid chatId)
        {
            var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;
            if (userId != null)
            {
                var chatJson = await _semanticService.GetConversation(Guid.Parse(userId), chatId);
                return Ok(chatJson);
            }
            return BadRequest();
        }
        [HttpPatch("conversation/{chatId:guid}")]
        public async Task<IActionResult> RenameOrDeleteChatTitle(Guid chatId, [FromQuery] string? title, [FromBody] DeleteRequest? deleteRequest)
        {
            var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;
            if (userId != null)
            {
                if (string.IsNullOrEmpty(title))
                {
                    // If the title is null or empty, check if delete request is present
                    if (deleteRequest != null && deleteRequest.Delete)
                    {
                        var result = await _userService.DeleteConversation(Guid.Parse(userId), chatId);
                        if (result)
                        {
                            return NoContent(); // Successfully deleted
                        }
                        return NotFound("Chat title not found.");
                    }
                    else
                    {
                        return BadRequest("Invalid request body. 'delete' property not found or empty.");
                    }
                }
                else
                {
                    // If the title is provided, rename the chat title
                    var result = await _userService.RenameConversation(Guid.Parse(userId), chatId, title);
                    if (result)
                    {
                        return NoContent(); // Successfully renamed
                    }
                    return NotFound("Chat title not found.");
                }
            }
            return BadRequest();
        }

        public class DeleteRequest
        {
            public bool Delete { get; set; }
        }

        public class CreateUserRequest
        {
            public string EmailId { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string Partner { get; set; }
        }

    }
}
