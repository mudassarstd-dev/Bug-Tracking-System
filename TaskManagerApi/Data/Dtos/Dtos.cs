public record CreateProjectDto(string Name, string? Description, List<string>? assigneeIds, string? logoPath);
public record UpdateProjectDto(string? Name, string? Description);
public record AssignUserDto(string ProjectId, string UserId, string Role);
public record ProjectDto(string id, string name, string? description, string? logoUrl, int totalTasks = 0, int completedTasks = 0);

public record CreateBugDto(
    string ProjectId,
    string Title,
    string Type,
    string? Description,
    DateTime? Deadline,
    string? ScreenshotUrl,
    string AssignedTo); 

public record UpdateBugDto(
    string? Title,
    string? Description,
    DateTime? Deadline,
    string? ScreenshotUrl,
    string? Type,
    string? Status,
    string? AssignedTo);

public record ProjectAssigneeDto(string id, string username, string role, string? avatar = null);