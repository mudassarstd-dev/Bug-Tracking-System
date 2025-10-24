using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.Runtime;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models.Dynamo;

public class DynamoBugService
{
    private readonly IDynamoDBContext _context;
    private readonly IUser _user;
    private readonly DynamoUserService _userService;

    public DynamoBugService(IDynamoDBContext context, IUser user, DynamoUserService userService)
    {
        _context = context;
        _user = user;
        _userService = userService;
    }

    public async Task<ApiResponse<string>> CreateBugAsync(CreateBugDto dto)
    {
        if (!isQa())
            return ApiResponse<string>.Fail("Manager Only operation", ErrorCode.InvalidCredentials);

        if (string.IsNullOrWhiteSpace(dto.ProjectId))
            return ApiResponse<string>.Fail("ProjectId is required");

        if (string.IsNullOrWhiteSpace(dto.Title))
            return ApiResponse<string>.Fail("Title is required");

        var bug = new Bug
        {
            Id = Guid.NewGuid().ToString(),
            ProjectId = dto.ProjectId,
            Title = dto.Title,
            Details = dto.Details,
            Deadline = dto.Deadline ?? DateTime.UtcNow.AddDays(7),
            ScreenshotUrl = dto.ScreenshotUrl,
            Type = Enum.TryParse<BugType>(dto.Type, true, out var type) ? type : BugType.Bug,
            Status = BugStatus.New,
            CreatedBy = _user.Id!,
            Assignees = dto.AssignedTo ?? new List<string>(),
            CreatedAt = DateTime.UtcNow
        };

        await _context.SaveAsync(bug);

        return ApiResponse<string>.Ok(bug.Id, "Bug created successfully");
    }


    public async Task<ApiResponse<BugDetailsForUpdateDto>> GetByIdAsync(string bugId)
    {
        var bug = await _context.LoadAsync<Bug>(bugId);

        var assignees = new List<UserAvatarDto>();

        foreach (var userId in bug.Assignees)
        {
            var user = await _userService.GetByIdAsync(userId);
            string? avatarUrl = null;

            if (!string.IsNullOrWhiteSpace(user.Data?.ProfileImageUrl))
            {
                avatarUrl = $"http://localhost:5153/uploads/{Path.GetFileName(user.Data.ProfileImageUrl)}";
            }
            else
            {
                avatarUrl = "https://avatar.iran.liara.run/public/boy";
            }

            assignees.Add(new UserAvatarDto(userId, avatarUrl));
        }

        var bugDetail = new BugDetailsForUpdateDto(
                id: bug.Id,
                details: bug.Details,
                title: bug.Title,
                status: bug.Status.ToString(),
                dueDate: bug.Deadline.ToString("yyyy-MM-dd"),
                assignees: assignees,
                screenshotUrl: bug.ScreenshotUrl == null ? null : $"http://localhost:5153/uploads/{Path.GetFileName(bug.ScreenshotUrl)}"
            );

        return bug != null ? ApiResponse<BugDetailsForUpdateDto>.Ok(bugDetail) : ApiResponse<BugDetailsForUpdateDto>.Fail("Bug detail not found", ErrorCode.NotFound);
    }

    public async Task<ApiResponse<List<BugDetailsDto>>> GetBugDetailsByProjectAsync(string projectId)
    {
        var query = _context.QueryAsync<Bug>(
            projectId,
            new QueryConfig
            {
                IndexName = "ProjectId-index"
            });

        var bugs = await query.GetRemainingAsync();

        var result = new List<BugDetailsDto>();

        foreach (var bug in bugs)
        {
            var assigneeDtos = new List<UserAvatarDto>();

            if (bug.Assignees != null && bug.Assignees.Any())
            {
                foreach (var userId in bug.Assignees)
                {
                    var user = await _userService.GetByIdAsync(userId);
                    string? avatarUrl = null;

                    if (!string.IsNullOrWhiteSpace(user.Data?.ProfileImageUrl))
                    {
                        avatarUrl = $"http://localhost:5153/uploads/{Path.GetFileName(user.Data.ProfileImageUrl)}";
                    }
                    else
                    {
                        avatarUrl = "https://avatar.iran.liara.run/public/boy";
                    }

                    assigneeDtos.Add(new UserAvatarDto(userId, avatarUrl));
                }
            }

            result.Add(new BugDetailsDto(
                id: bug.Id,
                details: bug.Details ?? "NA",
                status: bug.Status.ToString(),
                dueDate: bug.Deadline.ToString("yyyy-MM-dd"),
                assignees: assigneeDtos,
                canDelete: bug.CreatedBy == _user.Id ? true : false,
                canUpdate: assigneeDtos.Any(a => a.id == _user.Id) ? true : false
            ));
        }

        return ApiResponse<List<BugDetailsDto>>.Ok(result);
    }


    public async Task<ApiResponse<List<Bug>>> GetByDeveloperAsync(string developerId)
    {
        var scan = _context.ScanAsync<Bug>(new[] { new ScanCondition("AssignedTo", ScanOperator.Equal, developerId) });
        var bugs = await scan.GetRemainingAsync();
        return ApiResponse<List<Bug>>.Ok(bugs);
    }


    // public async Task<ApiResponse<Bug>> UpdateBugAsync(string bugId, UpdateBugDto dto)
    // {
    //     var bug = await _context.LoadAsync<Bug>(bugId);
    //     if (bug == null) return ApiResponse<Bug>.Fail("Bug not found", ErrorCode.NotFound);

    //     if (!string.IsNullOrWhiteSpace(dto.Title) && dto.Title != bug.Title)
    //     {
    //         // enforce title unique within project when changing
    //         var scan = _context.ScanAsync<Bug>(new[]
    //         {
    //             new ScanCondition("ProjectId", ScanOperator.Equal, bug.ProjectId),
    //             new ScanCondition("Title", ScanOperator.Equal, dto.Title)
    //         });
    //         var existing = await scan.GetRemainingAsync();
    //         if (existing.Any()) return ApiResponse<Bug>.Fail("Another bug with this title exists in project", ErrorCode.ValidationError);
    //         bug.Title = dto.Title;
    //     }

    //     if (dto.Description != null) bug.Description = dto.Description;
    //     // if (dto.Deadline.HasValue) bug.Deadline = dto.Deadline;
    //     if (dto.ScreenshotUrl != null)
    //     {
    //         if (!(dto.ScreenshotUrl.EndsWith(".png", StringComparison.OrdinalIgnoreCase) ||
    //               dto.ScreenshotUrl.EndsWith(".gif", StringComparison.OrdinalIgnoreCase)))
    //         {
    //             return ApiResponse<Bug>.Fail("Screenshot must be .png or .gif", ErrorCode.ValidationError);
    //         }
    //         bug.ScreenshotUrl = dto.ScreenshotUrl;
    //     }

    //     if (!string.IsNullOrWhiteSpace(dto.Type))
    //     {
    //         var t = dto.Type.ToLowerInvariant();
    //         if (t != "feature" && t != "bug")
    //             return ApiResponse<Bug>.Fail("Type must be 'feature' or 'bug'", ErrorCode.ValidationError);
    //         bug.Type = dto.Type;
    //     }

    //     if (!string.IsNullOrWhiteSpace(dto.Status))
    //     {
    //         // Validate allowed statuses depending on Type
    //         var allowed = bug.Type.ToLowerInvariant() == "feature"
    //             ? new[] { "new", "started", "completed" }
    //             : new[] { "new", "started", "resolved" };

    //         if (!allowed.Contains(dto.Status.ToLowerInvariant()))
    //             return ApiResponse<Bug>.Fail($"Invalid status for type {bug.Type}", ErrorCode.ValidationError);

    //         bug.Status = dto.Status;
    //     }

    //     if (!string.IsNullOrWhiteSpace(dto.AssignedTo)) bug.AssignedTo = dto.AssignedTo;

    //     await _context.SaveAsync(bug);
    //     return ApiResponse<Bug>.Ok(bug, "Bug updated");
    // }

    public async Task<ApiResponse<string>> DeleteBugAsync(string Id)
    {
        var bug = await _context.LoadAsync<Bug>(Id);
        if (bug == null) return ApiResponse<string>.Fail("Bug not found", ErrorCode.NotFound);

        await _context.DeleteAsync<Bug>(Id);
        return ApiResponse<string>.Ok("Bug deleted");
    }

    public async Task<ApiResponse<string>> UpdateStatusAsync(string bugId, UpdateBugStatusDto dto)
    {
        if (_user.Id == null || _user.Role != Role.Developer.ToString()) return ApiResponse<string>.Fail("Not allowed", ErrorCode.InvalidRole);

        if (!Enum.TryParse<BugStatus>(dto.status, true, out var parsedStatus))
            return ApiResponse<string>.Fail($"Invalid status '{dto.status}'", ErrorCode.NotFound);

        var bug = await _context.LoadAsync<Bug>(bugId);
        if (bug == null) return ApiResponse<string>.Fail("Bug not found", ErrorCode.NotFound);

        bug.Status = parsedStatus;
        bug.StatusLastUpdatedBy = _user.Id;
        await _context.SaveAsync(bug);

        return ApiResponse<string>.Ok("Status updated");
    }

    private bool isQa()
    {
        if (_user.Id == null || _user.Role != Role.QA.ToString()) return false;
        return true;
    }
}
