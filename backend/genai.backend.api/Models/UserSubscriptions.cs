using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace genai.backend.api.Models
{
    public class UserSubscription
    {
        public required string UserId { get; set; }

        public int ModelId { get; set; }

        public virtual required User User { get; set; }
        public virtual required AvailableModel AvailableModel { get; set; }
    }
}