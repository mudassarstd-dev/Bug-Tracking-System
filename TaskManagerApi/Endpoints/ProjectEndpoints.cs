using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.helper;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects");

        group.MapPost("/", async ([FromForm] string name, [FromForm] string? description, [FromForm] string assigneeIds, [FromForm] IFormFile? logo, DynamoProjectService service) =>
        {
            var assigneeIdList = string.IsNullOrWhiteSpace(assigneeIds)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(assigneeIds)!;

            string? logoPath = null;
            if (logo is not null)
            {
                logoPath = await FileHandler.SaveFileAsync(logo);
            }

            var dto = new CreateProjectDto(name, description, assigneeIdList, logoPath);

            return (await service.CreateProjectAsync(dto)).ToHttpResult();
        }).DisableAntiforgery();

        group.MapGet("/", async (DynamoProjectService service) =>
            (await service.GetAllAsync()).ToHttpResult());

        group.MapGet("/manager", async (DynamoProjectService service) =>
            (await service.GetByManagerAsync()).ToHttpResult()).RequireAuthorization(policy => policy.RequireRole(Role.Manager.ToString()));

        group.MapGet("/{projectId}", async (string projectId, DynamoProjectService service) =>
            (await service.GetByIdAsync(projectId)).ToHttpResult());

        // group.MapPut("/{projectId}", async (string projectId, [FromBody] UpdateProjectDto dto, DynamoProjectService service) =>
        //     (await service.UpdateProjectAsync(projectId, dto)).ToHttpResult());

        group.MapPut("/{projectId}", async (
            string projectId,
            [FromForm] string name,
            [FromForm] string? description,
            [FromForm] string assigneeIds,
            [FromForm] IFormFile? logo,
            DynamoProjectService service
        ) =>
        {
            var assigneeIdList = string.IsNullOrWhiteSpace(assigneeIds)
                ? new List<string>()
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(assigneeIds)!;

            string? logoPath = null;
            if (logo is not null)
            {
                logoPath = await FileHandler.SaveFileAsync(logo);
            }

            var dto = new UpdateProjectDto(name, description, assigneeIdList, logoPath);

            return (await service.UpdateProjectAsync(projectId, dto)).ToHttpResult();
        }).DisableAntiforgery();

        group.MapDelete("/{projectId}", async (string projectId, DynamoProjectService service) =>
            (await service.DeleteProjectAsync(projectId)).ToHttpResult());

        return app;
    }
}
