
using Amazon.DynamoDBv2.DataModel;

namespace TaskManagerApi.Data.Models.Dynamo;

[DynamoDBTable("ProjectAssignments")]
public class ProjectAssignment
{
    [DynamoDBHashKey]
    public string AssignmentId { get; set; } = Guid.NewGuid().ToString();

    public string ProjectId { get; set; }
    public string UserId { get; set; }
    public string Role { get; set; }
}

// there could a list of assignments under each project (List<string>(user_ids)) 