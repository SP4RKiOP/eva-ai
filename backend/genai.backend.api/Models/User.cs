using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace genai.backend.api.Models
{
    public class User
    {
        [Key]
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }

        // Navigation property for chat history
        public ICollection<ChatHistory> ChatHistory { get; set; }
        public virtual ICollection<UserSubscription> UserSubscriptions { get; set; }

        public User()
        {
            UserSubscriptions = new HashSet<UserSubscription>();
        }
    }
}
