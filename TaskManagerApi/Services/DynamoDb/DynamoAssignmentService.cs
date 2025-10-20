using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskManagerApi.Data.Models.Dynamo;

public class DynamoAssignmentService
{
    private readonly IDynamoDBContext _context;

    public DynamoAssignmentService(IDynamoDBContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<ProjectAssignment>> AssignUserAsync(ProjectAssignment assignment)
    {
        if (string.IsNullOrWhiteSpace(assignment.ProjectId) || string.IsNullOrWhiteSpace(assignment.UserId))
            return ApiResponse<ProjectAssignment>.Fail("ProjectId and UserId are required", ErrorCode.ValidationError);

        // Optional: prevent duplicate assignment
        var scan = _context.ScanAsync<ProjectAssignment>(new[]
        {
            new ScanCondition("ProjectId", ScanOperator.Equal, assignment.ProjectId),
            new ScanCondition("UserId", ScanOperator.Equal, assignment.UserId)
        });
        var existing = await scan.GetRemainingAsync();
        if (existing.Any())
            return ApiResponse<ProjectAssignment>.Fail("User already assigned to project", ErrorCode.ValidationError);

        await _context.SaveAsync(assignment);
        return ApiResponse<ProjectAssignment>.Ok(assignment, "User assigned to project");
    }

    public async Task<ApiResponse<List<ProjectAssignment>>> GetByProjectAsync(string projectId)
    {
        var scan = _context.ScanAsync<ProjectAssignment>(new[] { new ScanCondition("ProjectId", ScanOperator.Equal, projectId) });
        var list = await scan.GetRemainingAsync();
        return ApiResponse<List<ProjectAssignment>>.Ok(list);
    }

    public async Task<ApiResponse<List<ProjectAssignment>>> GetByUserAsync(string userId)
    {
        var scan = _context.ScanAsync<ProjectAssignment>(new[] { new ScanCondition("UserId", ScanOperator.Equal, userId) });
        var list = await scan.GetRemainingAsync();
        return ApiResponse<List<ProjectAssignment>>.Ok(list);
    }

    public async Task<ApiResponse<bool>> RemoveAssignmentAsync(string assignmentId)
    {
        var assignment = await _context.LoadAsync<ProjectAssignment>(assignmentId);
        if (assignment == null) return ApiResponse<bool>.Fail("Assignment not found", ErrorCode.NotFound);

        await _context.DeleteAsync<ProjectAssignment>(assignmentId);
        return ApiResponse<bool>.Ok(true, "Assignment removed");
    }
}
