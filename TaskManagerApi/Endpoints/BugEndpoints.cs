using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.helper;

public static class BugEndpoints
{
    public static IEndpointRouteBuilder MapBugEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bugs");

        group.MapPost("/", async (
            [FromForm] string projectId,
            [FromForm] string title,
            [FromForm] string? details,
            [FromForm] string assigneeIds, 
            [FromForm] string? dueDate,    
            [FromForm] IFormFile? attachment,
            DynamoBugService service
        ) =>
        {
            var assigneeIdList = string.IsNullOrWhiteSpace(assigneeIds)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(assigneeIds)!;

            string? screenshotUrl = null;
            if (attachment is not null)
            {
                screenshotUrl = await FileHandler.SaveFileAsync(attachment);
            }

            DateTime? deadline = null;
            if (!string.IsNullOrEmpty(dueDate))
            {
                if (DateTime.TryParse(dueDate, out var parsedDate))
                    deadline = parsedDate;
            }

            // Create DTO
            var dto = new CreateBugDto(
                ProjectId: projectId,
                Title: title,
                Type: "Bug",
                Details: details,
                Deadline: deadline,
                ScreenshotUrl: screenshotUrl,
                AssignedTo: assigneeIdList
            );
            
            var result = await service.CreateBugAsync(dto);
            return result.ToHttpResult();
        })
        .DisableAntiforgery();

        // group.MapGet("/", async (DynamoBugService service) =>
        //     (await service.GetByProjectAsync(null!)).ToHttpResult()); // optional admin endpoint - implement in service if needed

        group.MapGet("/{projectId}", async (string projectId, DynamoBugService service) =>
            (await service.GetBugDetailsByProjectAsync(projectId)).ToHttpResult());

        group.MapGet("/developer/{developerId}", async (string developerId, DynamoBugService service) =>
            (await service.GetByDeveloperAsync(developerId)).ToHttpResult());

        // group.MapGet("/{bugId}", async (string bugId, DynamoBugService service) =>
        //     (await service.GetByIdAsync(bugId)).ToHttpResult());

        // group.MapPut("/{bugId}", async (string bugId, UpdateBugDto dto, DynamoBugService service) =>
        //     (await service.UpdateBugAsync(bugId, dto)).ToHttpResult());

        // group.MapPut("/{bugId}/assign/{developerId}", async (string bugId, string developerId, DynamoBugService service) =>
        // {
        //     var updateDto = new UpdateBugDto(null, null, null, null, null, null, developerId);
        //     return (await service.UpdateBugAsync(bugId, updateDto)).ToHttpResult();
        // });

        // group.MapPut("/{bugId}/status/{status}", async (string bugId, string status, DynamoBugService service, IHttpContextAccessor ctx) =>
        // {
        //     // optionally enforce that only assigned developer or manager/QA can change status
        //     var role = ctx.HttpContext.User.FindFirst("role")?.Value ?? "Unknown";
        //     return (await service.UpdateStatusAsync(bugId, status, role)).ToHttpResult();
        // });

        group.MapDelete("/{bugId}", async (string bugId, DynamoBugService service) =>
            (await service.DeleteBugAsync(bugId)).ToHttpResult());

        return app;
    }
}
