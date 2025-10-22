using System.Data;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

namespace TaskManagerApi.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users");

        group.MapGet("/not-managers", async (DynamoUserService userService) =>
         (await userService.GetNotManagers()).ToHttpResult());

        group.MapGet("/devs", async (DynamoUserService userService) =>
         (await userService.GetDevelopers()).ToHttpResult());

        group.MapGet("/assignees/{projectId}", async (string projectId, DynamoUserService userService) =>
        (await userService.GetProjectAssignees(projectId)).ToHttpResult());

        return app;
    }
}