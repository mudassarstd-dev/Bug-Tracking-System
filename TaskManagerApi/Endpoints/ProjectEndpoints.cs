using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using TaskManagerApi.Data.Enums;

public static class ProjectEndpoints
{
    public static IEndpointRouteBuilder MapProjectEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/projects").RequireAuthorization();

        group.MapPost("/", async ([FromBody] CreateProjectDto dto, DynamoProjectService service) =>
        {
            return (await service.CreateProjectAsync(dto)).ToHttpResult();
        });

        group.MapGet("/", async (DynamoProjectService service) =>
            (await service.GetAllAsync()).ToHttpResult());

        group.MapGet("/manager", async (DynamoProjectService service) =>
            (await service.GetByManagerAsync()).ToHttpResult()).RequireAuthorization(policy => policy.RequireRole(Role.Manager.ToString()));

        group.MapGet("/{projectId}", async (string projectId, DynamoProjectService service) =>
            (await service.GetByIdAsync(projectId)).ToHttpResult());

        group.MapPut("/{projectId}", async (string projectId, [FromBody] UpdateProjectDto dto, DynamoProjectService service) =>
            (await service.UpdateProjectAsync(projectId, dto)).ToHttpResult());

        group.MapDelete("/{projectId}", async (string projectId, DynamoProjectService service) =>
            (await service.DeleteProjectAsync(projectId)).ToHttpResult());

        return app;
    }
}
