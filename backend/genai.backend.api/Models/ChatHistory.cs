using System.ComponentModel.DataAnnotations;

namespace genai.backend.api.Models
{
    public class ChatHistory
    {
        [Key]
        public string ChatId { get; set; }
        public string UserId { get; set; }
        public string ChatTitle { get; set; }
        public string ChatHistoryJson { get; set; }
        public DateTime CreatedOn { get; set; }
        public int? NetTokenConsumption { get; set; }
        public User User { get; set; }  // Navigation property
    }
}
