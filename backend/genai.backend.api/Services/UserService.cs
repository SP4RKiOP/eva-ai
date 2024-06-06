using genai.backend.api.Data;
using genai.backend.api.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace genai.backend.api.Services
{
    public class UserService
    {
        private readonly IConfiguration? _configuration;
        private readonly ApplicationDbContext _dbContext;

        public UserService(IConfiguration configuration, ApplicationDbContext dbContext)
        {
            _configuration = configuration;
            _dbContext = dbContext;
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
    }
}
