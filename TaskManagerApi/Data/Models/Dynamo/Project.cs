
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

  [DynamoDBTable("Projects")]
    public class Project
    {
        [DynamoDBHashKey]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? ImagePath { get; set; }
    
        [DynamoDBGlobalSecondaryIndexHashKey("ManagerIdIndex")] 
        public string ManagerId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }