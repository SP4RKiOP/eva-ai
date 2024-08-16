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
        public async Task<string> GetCreateUser(string emailId, string? firstName, string? lastName)
        {
            // Attempt to fetch the user and their subscribed models in a single query
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == emailId);

            if (user == null)
            {
                // User doesn't exist, so create a new one
                user = new User
                {
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = emailId
                };
                // Create a default entry for UserSubscriptions
                var defaultSubscription = new UserSubscription
                {
                    UserId = user.UserId,
                    ModelId = _configuration.GetValue<int>("DefaultModelId"), // Set the default ModelId as needed
                    User = user, // Set the User navigation property
                    AvailableModel = await _dbContext.AvailableModels.FirstOrDefaultAsync() // Set the AvailableModel navigation property
                };
                _dbContext.Users.Add(user);
                _dbContext.UserSubscriptions.Add(defaultSubscription);
                await _dbContext.SaveChangesAsync();
            }

            return user.UserId; // Return the UserId
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
                    }
                }

            }
            catch (Exception ex)
            {
                // Log or
                Console.WriteLine(ex.ToString());
                // Handle exceptions
                await _responseStream.ChatTitles(userId, JsonSerializer.Serialize(new { ChatId = userId, ChatTitle = "No Chat Found", CreatedOn = DateTime.Now }));
            }
        }
        public async Task GetAvailableModels(string userId)
        {
            var models = await _dbContext.UserSubscriptions
            .Include(u => u.AvailableModel)
            .Where(u => u.UserId == userId)
            .Select(m => new
            {
                Id = m.ModelId,
                ModelName = m.AvailableModel.DeploymentName.ToUpper()
            })
            .ToListAsync();

            if (models != null)
            {
                await _responseStream.AvailableModels(userId, models.ToArray());
            }
        }
    }
}
