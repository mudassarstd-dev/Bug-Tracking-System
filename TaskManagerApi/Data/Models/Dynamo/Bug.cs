
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

  [DynamoDBTable("Bugs")]
    public class Bug
    {
        [DynamoDBHashKey]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [DynamoDBGlobalSecondaryIndexHashKey("ProjectId-index")] 
        public string ProjectId { get; set; }
        public string Title { get; set; }
        public string? Details { get; set; }
        public DateTime Deadline { get; set; }
        public string? ScreenshotUrl { get; set; }
        public BugType Type { get; set; } 
        public BugStatus Status { get; set; }
        public string CreatedBy { get; set; } 
        public List<string> Assignees { get; set; }
        public string? StatusLastUpdatedBy { get; set; } 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }