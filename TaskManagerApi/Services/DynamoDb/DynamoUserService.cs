using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskManagerApi.Data.Models.Dynamo;

public class DynamoUserService
{
    private readonly IDynamoDBContext _context;
    private readonly IUser _user;

    public DynamoUserService(IDynamoDBContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<ApiResponse<User>> GetByIdAsync(string userId)
    {
        var user = await _context.LoadAsync<User>(userId);
        return user != null ? ApiResponse<User>.Ok(user) : ApiResponse<User>.Fail("User not found", ErrorCode.NotFound);
    }

    public async Task<ApiResponse<string>> GetMyProfile()
    {
        if (_user.Id == null) return ApiResponse<string>.Fail("User not authenticated", ErrorCode.InvalidCredentials);
        var user = await GetByIdAsync(_user.Id);
        // return a profile DTO with user image
        return ApiResponse<string>.Ok("Ok");
        // return user != null ? ApiResponse<User>.Ok(user) : ApiResponse<User>.Fail("User not found", ErrorCode.NotFound);

    }

    public async Task<ApiResponse<List<User>>> GetByRoleAsync(string role)
    {
        var scan = _context.ScanAsync<User>(new[] { new ScanCondition("Role", ScanOperator.Equal, role) });
        var users = await scan.GetRemainingAsync();
        return ApiResponse<List<User>>.Ok(users);
    }

    public async Task<ApiResponse<List<User>>> GetAllAsync()
    {
        var scan = _context.ScanAsync<User>(new List<ScanCondition>());
        var users = await scan.GetRemainingAsync();
        return ApiResponse<List<User>>.Ok(users);
    }
}
