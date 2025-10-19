using Microsoft.AspNetCore.Builder;

public static class BugEndpoints
{
    public static IEndpointRouteBuilder MapBugEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bugs");

        group.MapPost("/", async (CreateBugDto dto, DynamoBugService service, IHttpContextAccessor ctx) =>
        {
            // CreatedBy should be QA id from token; here we fetch sub claim for demonstration
            var creatorId = ctx.HttpContext.User.FindFirst("sub")?.Value ?? dto.AssignedTo; // fallback
            var bug = new TaskManagerApi.Data.Models.Dynamo.Bug
            {
                ProjectId = dto.ProjectId,
                Title = dto.Title,
                Type = dto.Type,
                Description = dto.Description,
                // Deadline = dto.Deadline,
                ScreenshotUrl = dto.ScreenshotUrl,
                AssignedTo = dto.AssignedTo,
                CreatedBy = creatorId
            };
            return (await service.CreateBugAsync(bug)).ToHttpResult();
        });

        group.MapGet("/", async (DynamoBugService service) =>
            (await service.GetByProjectAsync(null!)).ToHttpResult()); // optional admin endpoint - implement in service if needed

        group.MapGet("/project/{projectId}", async (string projectId, DynamoBugService service) =>
            (await service.GetByProjectAsync(projectId)).ToHttpResult());

        group.MapGet("/developer/{developerId}", async (string developerId, DynamoBugService service) =>
            (await service.GetByDeveloperAsync(developerId)).ToHttpResult());

        group.MapGet("/{bugId}", async (string bugId, DynamoBugService service) =>
            (await service.GetByIdAsync(bugId)).ToHttpResult());

        group.MapPut("/{bugId}", async (string bugId, UpdateBugDto dto, DynamoBugService service) =>
            (await service.UpdateBugAsync(bugId, dto)).ToHttpResult());

        group.MapPut("/{bugId}/assign/{developerId}", async (string bugId, string developerId, DynamoBugService service) =>
        {
            var updateDto = new UpdateBugDto(null, null, null, null, null, null, developerId);
            return (await service.UpdateBugAsync(bugId, updateDto)).ToHttpResult();
        });

        group.MapPut("/{bugId}/status/{status}", async (string bugId, string status, DynamoBugService service, IHttpContextAccessor ctx) =>
        {
            // optionally enforce that only assigned developer or manager/QA can change status
            var role = ctx.HttpContext.User.FindFirst("role")?.Value ?? "Unknown";
            return (await service.UpdateStatusAsync(bugId, status, role)).ToHttpResult();
        });

        group.MapDelete("/{bugId}", async (string bugId, DynamoBugService service) =>
            (await service.DeleteBugAsync(bugId)).ToHttpResult());

        return app;
    }
}
