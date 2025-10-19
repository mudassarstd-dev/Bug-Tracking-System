using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using TaskManagerApi.Data.Models.Dynamo;

public class DynamoBugService
{
    private readonly IDynamoDBContext _context;

    public DynamoBugService(IDynamoDBContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<Bug>> CreateBugAsync(Bug bug)
    {
        // required fields
        if (string.IsNullOrWhiteSpace(bug.Title) || string.IsNullOrWhiteSpace(bug.Type))
            return ApiResponse<Bug>.Fail("Title and Type are required", ErrorCode.ValidationError);

        // Validate type
        var typeLower = bug.Type.ToLowerInvariant();
        if (typeLower != "feature" && typeLower != "bug")
            return ApiResponse<Bug>.Fail("Type must be 'feature' or 'bug'", ErrorCode.ValidationError);

        // Validate status allowed set - default 'new' already OK

        // Validate screenshot extension if provided
        if (!string.IsNullOrWhiteSpace(bug.ScreenshotUrl))
        {
            if (!(bug.ScreenshotUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                  bug.ScreenshotUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase)))
            {
                return ApiResponse<Bug>.Fail("Screenshot must be .png or .gif", ErrorCode.ValidationError);
            }
        }

        // Enforce uniqueness of title within project:
        var scan = _context.ScanAsync<Bug>(new[]
        {
            new ScanCondition("ProjectId", ScanOperator.Equal, bug.ProjectId),
            new ScanCondition("Title", ScanOperator.Equal, bug.Title)
        });
        var existing = await scan.GetRemainingAsync();
        if (existing.Any())
            return ApiResponse<Bug>.Fail("A bug with this title already exists in the project", ErrorCode.ValidationError);

        // set default status for the type if not set
        if (string.IsNullOrWhiteSpace(bug.Status))
            bug.Status = "new";

        await _context.SaveAsync(bug);
        return ApiResponse<Bug>.Ok(bug, "Bug created");
    }

    public async Task<ApiResponse<Bug>> GetByIdAsync(string bugId)
    {
        var bug = await _context.LoadAsync<Bug>(bugId);
        return bug != null ? ApiResponse<Bug>.Ok(bug) : ApiResponse<Bug>.Fail("Bug not found", ErrorCode.NotFound);
    }

    public async Task<ApiResponse<List<Bug>>> GetByProjectAsync(string projectId)
    {
        var scan = _context.ScanAsync<Bug>(new[] { new ScanCondition("ProjectId", ScanOperator.Equal, projectId) });
        var bugs = await scan.GetRemainingAsync();
        return ApiResponse<List<Bug>>.Ok(bugs);
    }

    public async Task<ApiResponse<List<Bug>>> GetByDeveloperAsync(string developerId)
    {
        var scan = _context.ScanAsync<Bug>(new[] { new ScanCondition("AssignedTo", ScanOperator.Equal, developerId) });
        var bugs = await scan.GetRemainingAsync();
        return ApiResponse<List<Bug>>.Ok(bugs);
    }

    public async Task<ApiResponse<Bug>> UpdateBugAsync(string bugId, UpdateBugDto dto)
    {
        var bug = await _context.LoadAsync<Bug>(bugId);
        if (bug == null) return ApiResponse<Bug>.Fail("Bug not found", ErrorCode.NotFound);

        if (!string.IsNullOrWhiteSpace(dto.Title) && dto.Title != bug.Title)
        {
            // enforce title unique within project when changing
            var scan = _context.ScanAsync<Bug>(new[]
            {
                new ScanCondition("ProjectId", ScanOperator.Equal, bug.ProjectId),
                new ScanCondition("Title", ScanOperator.Equal, dto.Title)
            });
            var existing = await scan.GetRemainingAsync();
            if (existing.Any()) return ApiResponse<Bug>.Fail("Another bug with this title exists in project", ErrorCode.ValidationError);
            bug.Title = dto.Title;
        }

        if (dto.Description != null) bug.Description = dto.Description;
        // if (dto.Deadline.HasValue) bug.Deadline = dto.Deadline;
        if (dto.ScreenshotUrl != null)
        {
            if (!(dto.ScreenshotUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
                  dto.ScreenshotUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase)))
            {
                return ApiResponse<Bug>.Fail("Screenshot must be .png or .gif", ErrorCode.ValidationError);
            }
            bug.ScreenshotUrl = dto.ScreenshotUrl;
        }

        if (!string.IsNullOrWhiteSpace(dto.Type))
        {
            var t = dto.Type.ToLowerInvariant();
            if (t != "feature" && t != "bug")
                return ApiResponse<Bug>.Fail("Type must be 'feature' or 'bug'", ErrorCode.ValidationError);
            bug.Type = dto.Type;
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            // Validate allowed statuses depending on Type
            var allowed = bug.Type.ToLowerInvariant() == "feature"
                ? new[] { "new", "started", "completed" }
                : new[] { "new", "started", "resolved" };

            if (!allowed.Contains(dto.Status.ToLowerInvariant()))
                return ApiResponse<Bug>.Fail($"Invalid status for type {bug.Type}", ErrorCode.ValidationError);

            bug.Status = dto.Status;
        }

        if (!string.IsNullOrWhiteSpace(dto.AssignedTo)) bug.AssignedTo = dto.AssignedTo;

        await _context.SaveAsync(bug);
        return ApiResponse<Bug>.Ok(bug, "Bug updated");
    }

    public async Task<ApiResponse<bool>> DeleteBugAsync(string bugId)
    {
        var bug = await _context.LoadAsync<Bug>(bugId);
        if (bug == null) return ApiResponse<bool>.Fail("Bug not found", ErrorCode.NotFound);

        await _context.DeleteAsync<Bug>(bugId);
        return ApiResponse<bool>.Ok(true, "Bug deleted");
    }

    public async Task<ApiResponse<Bug>> UpdateStatusAsync(string bugId, string status, string requesterRole)
    {
        // requesterRole can be used by endpoints to guard who can update; method still validates
        var bug = await _context.LoadAsync<Bug>(bugId);
        if (bug == null) return ApiResponse<Bug>.Fail("Bug not found", ErrorCode.NotFound);

        var t = bug.Type.ToLowerInvariant();
        var allowed = t == "feature"
            ? new[] { "new", "started", "completed" }
            : new[] { "new", "started", "resolved" };

        if (!allowed.Contains(status.ToLowerInvariant()))
            return ApiResponse<Bug>.Fail("Invalid status for bug type", ErrorCode.ValidationError);

        bug.Status = status;
        await _context.SaveAsync(bug);

        return ApiResponse<Bug>.Ok(bug, "Status updated");
    }
}
