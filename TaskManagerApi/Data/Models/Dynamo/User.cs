using Amazon.DynamoDBv2.DataModel;


namespace TaskManagerApi.Data.Models.Dynamo;


[DynamoDBTable("Users")]
public class User
{
    [DynamoDBHashKey("Id")] // Partition key
    public string Id { get; set; }

    [DynamoDBProperty]
    public string Name { get; set; }

    [DynamoDBGlobalSecondaryIndexHashKey("Emailindex")] 
    [DynamoDBProperty]
    public string Email { get; set; } 

    [DynamoDBProperty]
    public string Phone { get; set; }

    [DynamoDBProperty]
    public string Role { get; set; }
    
    [DynamoDBProperty]
    public string Password { get; set; }
}
