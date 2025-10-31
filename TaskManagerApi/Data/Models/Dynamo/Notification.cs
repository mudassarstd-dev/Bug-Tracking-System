using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

[DynamoDBTable("Notifications")]
public class Notification
{
    [DynamoDBHashKey]
    public string UserId { get; set; }

    [DynamoDBRangeKey]
    public string NotificationId { get; set; } = Guid.NewGuid().ToString();
    public string Text { get; set; }
    public bool Read { get; set; } = false;
    public bool Actionable { get; set; } = false;
    public NotificationType NotificationType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow; 

    [DynamoDBProperty]
    public string? UnreadIndexKey { get; set; }
}