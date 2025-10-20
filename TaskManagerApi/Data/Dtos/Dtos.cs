public record CreateProjectDto(string Name, string? Description);
public record UpdateProjectDto(string? Name, string? Description);

public record AssignUserDto(string ProjectId, string UserId, string Role);

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
