using genai.backend.api.Models;
using Microsoft.EntityFrameworkCore;

namespace genai.backend.api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ChatHistory> ChatHistory { get; set; }

        public DbSet<AvailableModel> AvailableModels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Define relationships, constraints, etc. if needed
            modelBuilder.Entity<ChatHistory>()
                .HasOne(ch => ch.User)
                .WithMany(u => u.ChatHistory)
                .HasForeignKey(ch => ch.UserId);
        }
    }
}
