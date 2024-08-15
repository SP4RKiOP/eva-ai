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

        public DbSet<UserSubscription> UserSubscriptions { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite key for UserSubscription
            modelBuilder.Entity<UserSubscription>()
                .HasKey(us => new { us.UserId, us.ModelId });

            // If you have not already configured the relationships, do it here
            modelBuilder.Entity<UserSubscription>()
                .HasOne(us => us.User)
                .WithMany(u => u.UserSubscriptions)
                .HasForeignKey(us => us.UserId);

            modelBuilder.Entity<UserSubscription>()
                .HasOne(us => us.AvailableModel)
                .WithMany() // If AvailableModel does not have a navigation property back to UserSubscription, use WithMany without parameters
                .HasForeignKey(us => us.ModelId);

            // Define relationships, constraints, etc. if needed
            modelBuilder.Entity<ChatHistory>()
                .HasOne(ch => ch.User)
                .WithMany(u => u.ChatHistory)
                .HasForeignKey(ch => ch.UserId);
        }
    }
}
