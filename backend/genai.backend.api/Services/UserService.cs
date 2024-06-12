using genai.backend.api.Data;
using genai.backend.api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Text.Json;

namespace genai.backend.api.Services
{
    public class UserService
    {
        private readonly IConfiguration? _configuration;
        private readonly ApplicationDbContext _dbContext;
        private readonly ResponseStream _responseStream;

        public UserService(IConfiguration configuration, ApplicationDbContext dbContext, ResponseStream responseStream)
        {
            _configuration = configuration;
            _dbContext = dbContext;
            _responseStream = responseStream;
        }

        public string GetOrCreateUser(string emailId, string? firstName, string? lastName)
        {
            // Check if the user already exists in the database
            var existingUser = _dbContext.Users.FirstOrDefault(u => u.Email == emailId);
            if (existingUser != null && existingUser.UserId != null)
            {
                return existingUser.UserId;
            }
            else
            {
                // User doesn't exist, so create a new one
                var newUser = new User
                {
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = emailId
                };
                _dbContext.Users.Add(newUser);
                _dbContext.SaveChanges();
                return newUser.UserId; // Return the generated userId
            }
        }
        public async Task GetChatTitlesForUser(string userId)
        {
            try
            {
                await _responseStream.ClearChatTitles(userId);
                var chatTitles = await _dbContext.ChatHistory
                    .Where(ch => ch.UserId == userId)
                    .Select(ch => new 
                    { 
                        ch.ChatId, 
                        ch.ChatTitle, 
                        ch.CreatedOn 
                    })
                    .ToListAsync();
                if (chatTitles != null)
                {
                    foreach (var chatTitle in chatTitles)
                    {
                        await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(chatTitle));
                        Console.WriteLine(chatTitle);
                    }
                }

            }
            catch (Exception ex)
            {
                // Handle exceptions
                await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(new { ChatId = userId, ChatTitle = "No Chat Found", CreatedOn = DateTime.Now }));
            }
        }
        public async Task GetAvailableModels(string userId)
        {
            var models = await _dbContext.AvailableModels
            .Where(m => m.ModelType == "chat-completion")
            .Select(m => new
            {
                Id = m.DeploymentId,
                ModelName = m.DeploymentName.ToUpper()
            })
            .ToListAsync();

            if(models !=null)
            {
                await _responseStream.AvailableModels(userId, models.ToArray());
            }
        }
    }
}
