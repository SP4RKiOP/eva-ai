using Microsoft.AspNetCore.Mvc;
using genai.backend.api.Services;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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
        [AllowAnonymous]
        public async Task<IActionResult> GetOrCreateUser([FromBody] CreateUserRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.EmailId))
            {
                return BadRequest("EmailId is required.");
            }

            try
            {
                dynamic uId_token = await _userService.GetCreateUser(request.EmailId, request.FirstName, request.LastName, request.Partner);
                HttpContext.Response.Headers.Add("Authorization", uId_token.Token);
                return Ok(uId_token.UserId);
            }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("StreamUserData")]
        public async Task<IActionResult> StreamUserData()
        {
            try
            {
                var authHeader = HttpContext.Request.Headers["Authorization"].ToString();

                var token = authHeader.Substring("Bearer ".Length).Trim();

                // Decode the JWT token to get the userId
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);

                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid");

                var userId = userIdClaim.Value;
                await _userService.GetChatTitlesForUser(userId);
                await _userService.GetSubscribedModels(userId: userId);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("chat/{chatId}")]
        public async Task<IActionResult> RenameOrDeleteChatTitle(string chatId, [FromQuery] string? title)
        {
            var authHeader = HttpContext.Request.Headers["Authorization"].ToString();

            var token = authHeader.Substring("Bearer ".Length).Trim();

            // Decode the JWT token to get the userId
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);

            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "nameid");

            var userId = userIdClaim.Value;
            if (string.IsNullOrEmpty(title))
            {
                // If the title is null or empty, delete the chat title
                var result = await _userService.DeleteChatTitleAsync(userId, chatId);
                if (result)
                {
                    return NoContent(); // Successfully deleted
                }
                return NotFound("Chat title not found.");
            }
            else
            {
                // If the title is provided, rename the chat title
                var result = await _userService.RenameChatTitleAsync(userId, chatId, title);
                if (result)
                {
                    return NoContent(); // Successfully renamed
                }
                return NotFound("Chat title not found.");
            }
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
