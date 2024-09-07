using System.ComponentModel.DataAnnotations;

namespace genai.backend.api.Models
{
    public class AvailableModel
    {
        public Guid DeploymentId { get; set; }
        public string DeploymentName { get; set; }
        public string ModelName { get; set; }
        public string ModelType { get; set; }
        public string ModelVersion { get; set; }
        public string Provider { get; set; }
        public string Endpoint { get; set; }
        public string ApiKey { get; set; }
        public bool IsActive { get; set; }
    }
}
