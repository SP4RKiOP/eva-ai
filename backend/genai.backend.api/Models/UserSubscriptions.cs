using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace genai.backend.api.Models
{
    public class UserSubscription
    {
        public Guid UserId { get; set; }
        public Guid ModelId { get; set; }
    }
}