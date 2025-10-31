
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

[DynamoDBTable("ProjectAssignments")]
public class ProjectAssignment
{
    [DynamoDBHashKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [DynamoDBGlobalSecondaryIndexHashKey("ProjectIdIndex")]
    public string ProjectId { get; set; }
    
    [DynamoDBGlobalSecondaryIndexHashKey("UserIdIndex")] 
    public string UserId { get; set; }
    public string Role { get; set; }
}