using System.Data;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

namespace TaskManagerApi.Endpoints;

public static class TaskEndpoints
{
    public static IEndpointRouteBuilder MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tasks");
        // var group = app.MapGroup("/api/tasks").RequireAuthorization();

        group.MapPost("/", async (TaskItemDto task, TaskService taskService) =>
        {
            return TypedResults.Ok(await taskService.Create(task));
        }).RequireAuthorization("ManagerOnly"); // RB-Authorization not working here

        group.MapDelete("delete", async (int taskItemId, TaskService taskService) =>
        {
            return await taskService.Delete(taskItemId);
        });

        group.MapGet("/", async (TaskService taskService) =>
            await taskService.GetManagerTasks());

        return app;
    }
}
