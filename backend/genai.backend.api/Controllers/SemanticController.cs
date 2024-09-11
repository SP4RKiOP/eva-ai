using genai.backend.api.Services;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace genai.backend.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SemanticController : Controller
    {
        private readonly SemanticService _semanticService;

        public SemanticController(SemanticService semanticService)
        {
            _semanticService = semanticService;
        }
        public class PostRequest
        {
            public required Guid modelId { get; set; }
            public required string userInput { get; set; }
            public string? chatId { get; set; } // Nullable
        }

        [HttpPost]
        public async Task<IActionResult> PostQuery([FromBody] PostRequest requestBody)
        {
            try
            {
                var userId = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value;
                if (userId != null && requestBody != null && !string.IsNullOrEmpty(requestBody.userInput))
                {
                    var ChatId = await _semanticService.semanticChatAsync(Guid.Parse(userId), requestBody.modelId, requestBody.userInput, requestBody.chatId);

                    if (ChatId != null)
                    {
                        // If a new chat is started, return the new chat ID
                        return Ok(ChatId);
                    }
                    else
                    {
                        // If continuing an existing chat, return success
                        return Ok();
                    }
                }
                return BadRequest();
            }
            catch (Exception ex)
            {
                // Log the exception and return internal server error
                Console.WriteLine($"Semantic Controller: {ex.Message}");
                return StatusCode(500, $"{ex.Message}");
            }
        }

        

    }
}
