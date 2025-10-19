
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

  [DynamoDBTable("Bugs")]
    public class Bug
    {
        [DynamoDBHashKey]
        public string BugId { get; set; } = Guid.NewGuid().ToString();
        public string ProjectId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public DateTime Deadline { get; set; }
        public string? ScreenshotUrl { get; set; }
        public string Type { get; set; } 
        public string Status { get; set; }
        public string CreatedBy { get; set; } 
        public string AssignedTo { get; set; } // in case of single developer assignment
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }