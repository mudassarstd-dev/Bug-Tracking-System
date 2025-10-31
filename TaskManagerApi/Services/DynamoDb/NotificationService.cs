using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskManagerApi.Data.Models.Dynamo;

public class NotificationService
{
    private readonly IDynamoDBContext _context;

    public NotificationService(IDynamoDBContext context)
    {
        _context = context;
    }

    public async Task Save(Notification notification)
    {
        await _context.SaveAsync<Notification>(notification);
    }

    public async Task<List<Notification>> GetAllUnread(string userId)
    {
        var queryConfig = new QueryConfig
        {
            IndexName = "GSI_UnreadRecent",
            BackwardQuery = true,
            QueryFilter = new List<ScanCondition>()
        };

        var search = _context.QueryAsync<Notification>(userId, queryConfig);
        return await search.GetRemainingAsync();
    }

    public async Task MarkAsRead(string userId, string notificationId)
    {
        var notification = await _context.LoadAsync<Notification>(userId, notificationId);
        if (notification == null) return;

        notification.Read = true;
        notification.UnreadIndexKey = null;  

        await _context.SaveAsync(notification);
    }
}
