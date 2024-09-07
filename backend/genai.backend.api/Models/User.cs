using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace genai.backend.api.Models
{
    public class User
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Partner { get; set; }
    }
}
