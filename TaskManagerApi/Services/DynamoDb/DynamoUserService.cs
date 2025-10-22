using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using SQLitePCL;
using TaskManagerApi.Data.Enums;
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

    public async Task<ApiResponse<List<ProjectAssigneeDto>>> GetNotManagers()
    {
        if (!isManager()) return ApiResponse<List<ProjectAssigneeDto>>.Fail("Manager Only", ErrorCode.InvalidRole);

        // only get those users to whom project is not already assigned

        var scanConditions = new List<ScanCondition>
            {
                new ScanCondition("Role", ScanOperator.In, new[] { Role.Developer.ToString(), Role.QA.ToString() })
            };

        var scan = _context.ScanAsync<User>(scanConditions);
        var users = await scan.GetRemainingAsync();

        var result = users.Select(u => new ProjectAssigneeDto(id: u.Id, username: u.Name, role: u.Role)).ToList();

        return ApiResponse<List<ProjectAssigneeDto>>.Ok(result);
    }
    
    public async Task<ApiResponse<List<UserAvatarDto>>> GetDevelopers()
    {
        // if (!isManager()) return ApiResponse<List<ProjectAssigneeDto>>.Fail("Manager Only", ErrorCode.InvalidRole);

        var scanConditions = new List<ScanCondition>
            {
                new ScanCondition("Role", ScanOperator.In, new[] { Role.Developer.ToString() })
            };

        var scan = _context.ScanAsync<User>(scanConditions);
        var users = await scan.GetRemainingAsync();

        var result = users.Select(u => new UserAvatarDto(id: u.Id, avatar: u.ProfileImageUrl)).ToList();

        return ApiResponse<List<UserAvatarDto>>.Ok(result);
    }

    public async Task<ApiResponse<List<ProjectAssigneeDto>>> GetProjectAssignees(string projectId)
    {
        if (!isManager()) return ApiResponse<List<ProjectAssigneeDto>>.Fail("Manager Only", ErrorCode.InvalidRole);

        var query = _context.QueryAsync<ProjectAssignment>(
            projectId,
            new QueryConfig
            {
                IndexName = "ProjectIdIndex"
            });

        var assigees = await query.GetRemainingAsync();
        var assigneeIds = assigees.Select(a => a.UserId);

        var batchGet = _context.CreateBatchGet<User>();
        foreach (var uid in assigneeIds)
        {
            batchGet.AddKey(uid); 
        }

        await batchGet.ExecuteAsync();

        var users = batchGet.Results;
        var result = users.Select(u => new ProjectAssigneeDto(id: u.Id, username: u.Name, role: u.Role)).ToList();

        return ApiResponse<List<ProjectAssigneeDto>>.Ok(result);
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

    private bool isManager()
    {
        if (_user.Id == null || _user.Role != Role.Manager.ToString()) return false;
        return true;
    }
}
