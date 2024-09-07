using genai.backend.api.Data;
using genai.backend.api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace genai.backend.api.Services
{
    public class UserService
    {
        private readonly IConfiguration? _configuration;
        private readonly ApplicationDbContext _dbContext;
        private readonly ResponseStream _responseStream;
        private readonly IMemoryCache _cache;
        public UserService(IConfiguration configuration, ApplicationDbContext dbContext, ResponseStream responseStream, IMemoryCache cache)
        {
            _configuration = configuration;
            _dbContext = dbContext;
            _responseStream = responseStream;
            _cache = cache;
        }
        public async Task<Object> GetCreateUser(string emailId, string? firstName, string? lastName, string partner)
        {
            // Attempt to fetch the user and their subscribed models in a single query
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == emailId && u.Partner == partner);

            if (user == null)
            {
                // User doesn't exist, so create a new one
                user = new User
                {
                    UserId = Guid.NewGuid().ToString(),
                    FirstName = firstName,
                    LastName = lastName,
                    Email = emailId,
                    Partner = partner
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
            // Generate JWT token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:SecretKey"]); // Replace with your secret key
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                new Claim(ClaimTypes.NameIdentifier, user.UserId)
                }),
                Expires = DateTime.UtcNow.AddDays(1), // Token expiry time
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return new { UserId = user.UserId, Token = tokenString };
        }
        public async Task<Object> Conversations(string userId)
        {
            try
            {
                var chatTitles = await _dbContext.ChatHistory
                    .Where(ch => ch.UserId == userId)
                    .Select(ch => new 
                    { 
                        id = ch.ChatId,
                        title = ch.ChatTitle, 
                        lastActivity = ch.CreatedOn
                    })
                    .ToListAsync();
                if (chatTitles != null && chatTitles.Count > 0)
                {
                    return JsonSerializer.Serialize(chatTitles);
                }
                return new { };
            }
            catch (Exception ex)
            {
                // Log or
                Console.WriteLine(ex.ToString());
                return new { };
            }
        }
        public async Task<Object> GetSubscribedModels(string userId)
        {
            var models = await _dbContext.UserSubscriptions
            .Include(u => u.AvailableModel)
            .Where(u => u.UserId == userId)
            .Select(m => new
            {
                id = m.ModelId,
                name = m.AvailableModel.DeploymentName.ToUpper()
            })
            .ToListAsync();

            if (models != null)
            {
                return JsonSerializer.Serialize(models.ToArray());
            }
            return new { };
        }
        public async Task<bool> RenameConversation(string userId, string chatId, string newTitle)
        {
            var chat = await _dbContext.ChatHistory
                .FirstOrDefaultAsync(ch => ch.UserId == userId && ch.ChatId == chatId);

            if (chat == null)
            {
                return false; // Chat not found
            }

            chat.ChatTitle = newTitle;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteConversation(string userId, string chatId)
        {
            var chat = await _dbContext.ChatHistory
                .FirstOrDefaultAsync(ch => ch.UserId == userId && ch.ChatId == chatId);

            if (chat == null)
            {
                return false; // Chat not found
            }

            _dbContext.ChatHistory.Remove(chat);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
