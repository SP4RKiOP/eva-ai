using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel;
using System.Text;
using System.Text.Json;
using System.Diagnostics.CodeAnalysis;

namespace genai.backend.api.Services
{
    /// <summary>
    /// Service class for handling semantic operations.
    /// </summary>
    public class SemanticService
    {
        private readonly IConfiguration _configuration;
        private readonly Kernel _chatKernel;
        private readonly IChatCompletionService _chatCompletion;

        /// <summary>
        /// Initializes a new instance of the <see cref="SemanticService"/> class.
        /// </summary>
        /// <param name="configuration">The configuration object.</param>
        public SemanticService(IConfiguration configuration)
        {
            _configuration = configuration;

            // Get values from appsettings.json
            var gptdeployName = _configuration["AzureOpenAI:GPTDeployName"];
            var endpoint = _configuration["AzureOpenAI:Endpoint"];
            var apiKey = _configuration["AzureOpenAI:ApiKey"];

            _chatKernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion(
                    deploymentName: gptdeployName,
                    endpoint: endpoint,
                    apiKey: apiKey)
                .Build();

            _chatCompletion = _chatKernel.GetRequiredService<IChatCompletionService>();
        }

        /// <summary>
        /// Starts a new chat session with the specified user input.
        /// </summary>
        /// <param name="userInput">The user input.</param>
        /// <returns>The response from the chat session.</returns>
        public async Task<string> StartNewChat(string userInput)
        {
            try
            {
                var promptTemplate = "You are an AI developed by Abhishek, dedicated to assisting users with their tasks seamlessly, regardless of the context provided." +
                    " Assume the persona of a reliable virtual assistant, poised to tackle any challenge with ease." +
                    " Your task is to deliver responses in markdown syntax for all queries and in code format for coding-related queries." +
                    " Your responses should be clear, concise and confident, yet infused with a friendly, helpful, and neutral tone to foster a positive user experience otherwise you will be penalized." +
                    " Whether it's offering step-by-step instructions, providing explanations, or troubleshooting issues, your aim is to communicate in a way that is polite and respectful while providing useful information or assistance." +
                    " Remember to adapt your responses to suit the specific needs and preferences of each user, demonstrating versatility and reliability at every turn.";

                var promptTemplateFactory = new KernelPromptTemplateFactory();
                string systemMessage = await promptTemplateFactory.Create(new PromptTemplateConfig(promptTemplate)).RenderAsync(_chatKernel);

                var newChatHistory = new Microsoft.SemanticKernel.ChatCompletion.ChatHistory(systemMessage);
                newChatHistory.AddMessage(AuthorRole.User, userInput);

                var llmresponse = await _chatCompletion.GetChatMessageContentAsync(newChatHistory, new OpenAIPromptExecutionSettings { MaxTokens = 4096, Temperature = 0.001 });
                newChatHistory.AddMessage(AuthorRole.Assistant, llmresponse.Content);

                return llmresponse.Content;
            }
            catch (Exception ex)
            {
                if (ex.InnerException is Azure.RequestFailedException requestFailedException && requestFailedException.ErrorCode == "content_filter")
                {
                    return "Your query got a content warning,\r\nPlease remove any words showing **HATE, SELF HARM, SEXUAL, VIOLENCE** from your query and rewrite it.";
                }

                return $"Error starting new chat: {ex.InnerException?.Message ?? ex.Message}";
            }
        }
    }
}
