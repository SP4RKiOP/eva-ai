using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel;
using StackExchange.Redis;
using System.Text;
using System.Text.Json;
using System.Diagnostics.CodeAnalysis;
using genai.backend.api.Data;
using Microsoft.AspNetCore.SignalR;
using ZstdSharp.Unsafe;
using genai.backend.api.Models;

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
        private readonly IConnectionMultiplexer _redisConnection;
        private readonly ApplicationDbContext _dbContext;
        private readonly ResponseStream _responseStream;

        /// <summary>
        /// Initializes a new instance of the <see cref="SemanticService"/> class.
        /// </summary>
        /// <param name="configuration">The configuration object.</param>
        /// <param name="dbContext">The application database context.</param>
        public SemanticService(IConfiguration configuration, ApplicationDbContext dbContext, ResponseStream responseStream)
        {
            _configuration = configuration;
            _dbContext = dbContext;
            _responseStream = responseStream;

            // Get values from appsettings.json
            var gptdeployName = _configuration["AzureOpenAI:GPTDeployName"];
            var endpoint = _configuration["AzureOpenAI:Endpoint"];
            var apiKey = _configuration["AzureOpenAI:ApiKey"];
            var redisConnection = _configuration["ConnectionStrings:Redis"];
            _redisConnection = ConnectionMultiplexer.Connect(redisConnection);
            _chatKernel = Kernel.CreateBuilder()
                .AddAzureOpenAIChatCompletion(
                    deploymentName: gptdeployName,
                    endpoint: endpoint,
                    apiKey: apiKey)
                .Build();

            _chatCompletion = _chatKernel.GetRequiredService<IChatCompletionService>();
        }

        /// <summary>
        /// Handles the semantic chat operation.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="userInput">The user input.</param>
        /// <param name="chatId">The chat ID.</param>
        public async Task<string> semanticChatAsync(string userId, string userInput, string chatId = null)
        {
            try
            {
                if (chatId != null && chatId.Length !=0)
                {
                    await ContinueExistingChat(userId, chatId, userInput);
                    return null;
                }
                else
                {
                    return await StartNewChat(userId, userInput);

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing semantic function: {ex.Message}");
                throw;
            }
        }

        private async Task ContinueExistingChat(string userId, string chatId, string userInput)
        {
            try
            {
                var existingChatHistory = await _dbContext.ChatHistory
                    .FirstOrDefaultAsync(ch => ch.ChatId == chatId);

                var oldchatHistory = JsonSerializer.Deserialize<Microsoft.SemanticKernel.ChatCompletion.ChatHistory>(existingChatHistory.ChatHistoryJson);
                oldchatHistory.AddMessage(AuthorRole.User, userInput);

                var llmresponse = _chatCompletion.GetStreamingChatMessageContentsAsync(oldchatHistory, new OpenAIPromptExecutionSettings { MaxTokens = 4096, Temperature = 0.001 });

                var fullMessage = new StringBuilder();
                //await _responseStream.BeginStream(chatId);
                await foreach (var chatUpdate in llmresponse)
                {
                    if (!string.IsNullOrEmpty(chatUpdate.Content))
                    {
                        fullMessage.Append(chatUpdate.Content);
                        await _responseStream.PartialResponse(userId, JsonSerializer.Serialize(new { ChatId = chatId, PartialContent = chatUpdate.Content }));
                        await Task.Delay(8);//5ms response stream delay for smooth chat stream
                    }
                }
                await _responseStream.EndStream(userId);

                oldchatHistory.AddMessage(AuthorRole.Assistant, fullMessage.ToString());

                existingChatHistory.ChatHistoryJson = JsonSerializer.Serialize(oldchatHistory);
                existingChatHistory.CreatedOn = DateTime.Now;
                await _dbContext.SaveChangesAsync();
                await _responseStream.ClearChatTitles(userId);
                await GetChatTitlesForUser(userId);
            }
            catch (Exception ex)
            {
                if (ex.InnerException is Azure.RequestFailedException requestFailedException && requestFailedException.ErrorCode == "content_filter")
                {
                    await _responseStream.PartialResponse(userId, "Your query got a filtered content warning,\r\nPlease remove any words showing **HATE, SELF HARM, SEXUAL, VIOLENCE** from your query and rewrite it.");
                }
                await _responseStream.PartialResponse(chatId, $"Error continuing chat with existing history: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Starts a new chat.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="userInput">The user input.</param>
        public async Task<string> StartNewChat(string userId, string userInput)
        {
            var newChatId = Guid.NewGuid().ToString();
            try
            {
                var promptTemplate = "You are ChatIQ an AI developed by Abhishek, dedicated to assisting users with their tasks seamlessly, regardless of the context provided." +
                    " Assume the persona of a reliable virtual assistant, poised to tackle any challenge with ease." +
                    " Your task is to deliver responses in markdown syntax for all queries and in code format for coding-related queries." +
                    " Your responses should be clear, concise and confident, yet infused with a friendly, helpful, and neutral tone to foster a positive user experience otherwise you will be penalized." +
                    " Whether it's offering step-by-step instructions, providing explanations, or troubleshooting issues, your aim is to communicate in a way that is polite and respectful while providing useful information or assistance." +
                    " Remember to adapt your responses to suit the specific needs and preferences of each user, demonstrating versatility and reliability at every turn.";

                var promptTemplateFactory = new KernelPromptTemplateFactory();
                var systemMessage = await promptTemplateFactory.Create(new PromptTemplateConfig(promptTemplate)).RenderAsync(_chatKernel);

                var newChatHistory = new Microsoft.SemanticKernel.ChatCompletion.ChatHistory(systemMessage);
                newChatHistory.AddMessage(AuthorRole.User, userInput);
                var llmresponse = _chatCompletion.GetStreamingChatMessageContentsAsync(newChatHistory, new OpenAIPromptExecutionSettings { MaxTokens = 4096, Temperature = 0.001 });
                var fullMessage = new StringBuilder();
                //await _responseStream.BeginStream(userId);
                await foreach (var chatUpdate in llmresponse)
                {
                    if (!string.IsNullOrEmpty(chatUpdate.Content))
                    {
                        fullMessage.Append(chatUpdate.Content);
                        await _responseStream.PartialResponse(userId, JsonSerializer.Serialize(new { ChatId = userId, PartialContent = chatUpdate.Content }));
                        await Task.Delay(8);//5ms response stream delay for smooth chat stream
                    }
                }
                await _responseStream.EndStream(userId);

                newChatHistory.AddMessage(AuthorRole.Assistant, fullMessage.ToString());

                var updatedJsonChatHistory = JsonSerializer.Serialize(newChatHistory);
                var newTitle = await NewChatTitle(newChatHistory.ElementAt(1).Content.ToString());
                var dbchatHistory = new Models.ChatHistory
                {
                    UserId = userId,
                    ChatId = newChatId,
                    ChatTitle = newTitle,
                    ChatHistoryJson = updatedJsonChatHistory,
                    CreatedOn = DateTime.Now
                };
                _dbContext.ChatHistory.Add(dbchatHistory);
                await _dbContext.SaveChangesAsync();
                await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(new { ChatId = newChatId, ChatTitle = newTitle, CreatedOn = DateTime.Now }));
                return newChatId;
            }
            catch (Exception ex)
            {
                if (ex.InnerException is Azure.RequestFailedException requestFailedException && requestFailedException.ErrorCode == "content_filter")
                {
                    await _responseStream.PartialResponse(userId, "Your query got a filtered content warning,\r\nPlease remove any words showing **HATE, SELF HARM, SEXUAL, VIOLENCE** from your query and rewrite it.");
                }
                await _responseStream.PartialResponse(userId, $"Error starting new chat: {ex.InnerException?.Message ?? ex.Message}");
                throw;
            }
        }
        public async Task GetChatTitlesForUser(string userId)
        {
            try
            {
                await _responseStream.ClearChatTitles(userId);
                var chatTitles = await _dbContext.ChatHistory
                    .Where(ch => ch.UserId == userId)
                    .Select(ch => new { ch.ChatId, ch.ChatTitle, ch.CreatedOn })
                    .ToListAsync();
                if(chatTitles!=null)
                {
                    foreach (var chatTitle in chatTitles)
                    {
                        await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(chatTitle));
                    }
                }

            }
            catch (Exception ex)
            {
                // Handle exceptions
                await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(new { ChatId=userId, ChatTitle="No Chat Found", CreatedOn=DateTime.Now}));
            }
        }
        public async Task<string> GetChatHistory(string chatId)
        {
            try
            {
                /*await _responseStream.ClearChatTitles(chatId);*/
                var chatHistory = await _dbContext.ChatHistory
                    .FirstOrDefaultAsync(ch => ch.ChatId == chatId);

                if (chatHistory == null)
                {
                    return $"Chat history not found for chat ID: {chatId}";
                }

                /*var userId = chatHistory.UserId;

                var chatTitles = await _dbContext.ChatHistory
                    .Where(ch => ch.UserId == userId)
                    .Select(ch => new { ch.ChatId, ch.ChatTitle, ch.CreatedOn })
                    .ToListAsync();

                foreach (var chatTitle in chatTitles)
                {
                    await _responseStream.ChatTitles(chatId, JsonSerializer.Serialize(chatTitle));
                    await Task.Delay(2);
                }*/

                return chatHistory.ChatHistoryJson;
            }
            catch (Exception ex)
            {
                // Handle exceptions
                return $"Error getting chat history: {ex.Message}";
            }
        }

        private async Task<string> NewChatTitle(string userInput)
        {
            var prompt = "You are a Text model. I will type in message and you will reply with a text in no more than 5 word which should capture the essence of message." +
                " my first Message: '{{$input}}'";
            var func = _chatKernel.CreateFunctionFromPrompt(prompt);
            var response = await func.InvokeAsync(_chatKernel, new() { ["input"] = userInput });
            var title = response.GetValue<string>();

            // Remove double quotes if they exist
            if (title.StartsWith('"') && title.EndsWith('"') && title.Length > 1)
            {
                title = title[1..^1]; // Remove the first and last characters
            }
            else if (title.StartsWith('\'') && title.EndsWith('\'') && title.Length > 1)
            {
                title = title[1..^1]; // Remove the first and last characters
            }

            return title;
        }
    }
}
