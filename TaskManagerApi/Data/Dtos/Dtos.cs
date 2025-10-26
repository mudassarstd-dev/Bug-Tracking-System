public record CreateProjectDto(string Name, string? Description, List<string>? assigneeIds, string? logoPath);
public record UpdateProjectDto(string? Name, string? Description, List<string>? assigneeIds, string? logoPath);
public record AssignUserDto(string ProjectId, string UserId, string Role);
public record ProjectDto(string id, string name, string? description, string? logoUrl, int totalTasks = 0, int completedTasks = 0);
public record BugDetailsDto(string id, string details, string status, string dueDate, List<UserAvatarDto> assignees,bool canDelete, bool canUpdate);
public record UserAvatarDto(string id, string? avatar, string? name = null);
public record UserProfileDto(string name, string email, string phone, string? imageUrl);
public record UpdateUserDto(string? name, string? phone, string? imageUrl);
public record UpdateBugStatusDto(string status);
public record BugDetailsForUpdateDto(string id, string details, string title, string status, string dueDate, List<UserAvatarDto> assignees, string? screenshotUrl);
public record CreateBugDto(
    string ProjectId,
    string Title,
    string Type,
    string? Details,
    DateTime? Deadline,
    string? ScreenshotUrl,
    List<string> AssignedTo); 

public record UpdateBugDto(
    string? Title,
    string? Details,
    DateTime? Deadline,
    string? ScreenshotUrl,
    string? Type,
    List<string> AssignedTo);

public record ProjectAssigneeDto(string id, string username, string role, string? avatar = null);