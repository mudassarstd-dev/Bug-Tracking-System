
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

  [DynamoDBTable("Notifications")]
    public class Notification
    {
        [DynamoDBHashKey]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Text { get; set; }
        public bool Actionable  { get; set; }
        public bool Read  { get; set; }
        public string Audience { get; set; }
        public NotificationType notificationType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }