using System.ComponentModel.DataAnnotations;

namespace genai.backend.api
{
    public class AvailableModel
    {
        [Key]
        public int DeploymentId { get; set; }
        public required string DeploymentName { get; set; }
        public required string ModelName { get; set; }
        public string? ModelType { get; set; }
        public string? ModelVersion { get; set; }
        public required string Provider { get; set; }
        public string? Endpoint { get; set; }
        public required string ApiKey { get; set; }
        public required bool IsActive { get; set; }
    }
}
