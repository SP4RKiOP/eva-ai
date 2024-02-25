using genai.backend.api.Services;
using Microsoft.AspNetCore.Mvc;

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
            public required string userInput { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> PostQuery([FromBody] PostRequest requestBody)
        {
            try
            {
                // Check if the 'question' property exists in the request body
                if (requestBody != null && !string.IsNullOrEmpty(requestBody.userInput))
                {
                    var skresponse = await _semanticService.StartNewChat(requestBody.userInput);
                    // Explicitly set the content type as JSON
                    var response = new ContentResult
                    {
                        Content = skresponse,
                        ContentType = "application/json"
                    };

                    return response;
                }
                else
                {
                    return BadRequest("Invalid request body. 'question' property not found or empty.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
