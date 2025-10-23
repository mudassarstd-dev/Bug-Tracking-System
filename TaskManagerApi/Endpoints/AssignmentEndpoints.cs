using Microsoft.AspNetCore.Builder;

public static class AssignmentEndpoints
{
    public static IEndpointRouteBuilder MapAssignmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/assignments").RequireAuthorization();

        group.MapPost("/", async (AssignUserDto dto, DynamoAssignmentService service) =>
        {
            var assignment = new TaskManagerApi.Data.Models.Dynamo.ProjectAssignment
            {
                ProjectId = dto.ProjectId,
                UserId = dto.UserId,
                Role = dto.Role
            };
            return (await service.AssignUserAsync(assignment)).ToHttpResult();
        });

        group.MapGet("/project/{projectId}", async (string projectId, DynamoAssignmentService service) =>
            (await service.GetByProjectAsync(projectId)).ToHttpResult());

        group.MapGet("/user/{userId}", async (string userId, DynamoAssignmentService service) =>
            (await service.GetByUserAsync(userId)).ToHttpResult());

        group.MapDelete("/{assignmentId}", async (string assignmentId, DynamoAssignmentService service) =>
            (await service.RemoveAssignmentAsync(assignmentId)).ToHttpResult());

        return app;
    }
}
