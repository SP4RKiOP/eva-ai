using genai.backend.api.Services;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace genai.backend.api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemanticController : Controller
    {
        private readonly SemanticService _semanticService;

        public SemanticController(SemanticService semanticService)
        {
            _semanticService = semanticService;
        }
        public class PostRequest
        {
            public required int modelId { get; set; }
            public required string userInput { get; set; }
            public string? chatId { get; set; } // Nullable
        }

        [HttpPost]
        public async Task<IActionResult> PostQuery([FromBody] PostRequest requestBody)
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
                // Check if the 'question' property exists in the request body
                if (requestBody != null && !string.IsNullOrEmpty(requestBody.userInput))
                {
                    var ChatId = await _semanticService.semanticChatAsync(userId, requestBody.modelId, requestBody.userInput, requestBody.chatId);

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
                else
                {
                    // Return a bad request response if the request body is invalid
                    return BadRequest("Invalid request body. 'question' property not found or empty.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return internal server error
                Console.WriteLine($"Internal server error: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        

    }
}
