using Amazon.DynamoDBv2;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.helper;

public static class BugEndpoints
{
    public static IEndpointRouteBuilder MapBugEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bugs").RequireAuthorization();

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

        group.MapGet("bug/{bugId}", async (string bugId, DynamoBugService service) =>
            (await service.GetByIdAsync(bugId)).ToHttpResult());

        group.MapPut("/{bugId}", async (
                    string bugId,
                    [FromForm] string title,
                    [FromForm] string? details,
                    [FromForm] string assigneeIds,
                    [FromForm] string? dueDate,
                    [FromForm] IFormFile? screenshot,
                    DynamoBugService service
                    ) =>
                    {
                        var assigneeIdList = string.IsNullOrWhiteSpace(assigneeIds)
                            ? new List<string>()
                            : System.Text.Json.JsonSerializer.Deserialize<List<string>>(assigneeIds)!;

                        string? screenshotUrl = null;
                        if (screenshot is not null)
                        {
                            screenshotUrl = await FileHandler.SaveFileAsync(screenshot);
                        }

                        DateTime? deadline = null;
                        if (!string.IsNullOrEmpty(dueDate) && DateTime.TryParse(dueDate, out var parsedDate))
                        {
                            deadline = parsedDate;
                        }

                        var dto = new UpdateBugDto(
                            Title: title,
                            Details: details,
                            Type: "Bug",
                            Deadline: deadline,
                            ScreenshotUrl: screenshotUrl,
                            AssignedTo: assigneeIdList
                        );

                        var result = await service.UpdateBugAsync(bugId, dto);
                        return result.ToHttpResult();
                    })
                    .DisableAntiforgery();


        group.MapPut("status/{bugId}", async (string bugId, UpdateBugStatusDto dto, DynamoBugService service) =>
            (await service.UpdateStatusAsync(bugId, dto)).ToHttpResult());

        group.MapDelete("/{bugId}", async (string bugId, DynamoBugService service) =>
            (await service.DeleteBugAsync(bugId)).ToHttpResult());

        return app;
    }
}
