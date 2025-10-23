using System.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;
using TaskManagerApi.helper;

namespace TaskManagerApi.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users");

        group.MapGet("/not-managers", async (DynamoUserService userService) =>
         (await userService.GetNotManagers()).ToHttpResult());

        group.MapGet("/profile", async (DynamoUserService userService) =>
        (await userService.GetMyProfile()).ToHttpResult());

        group.MapGet("/devs", async (DynamoUserService userService) =>
         (await userService.GetDevelopers()).ToHttpResult());

        group.MapGet("/assignees/{projectId}", async (string projectId, DynamoUserService userService) =>
        (await userService.GetProjectAssignees(projectId)).ToHttpResult());


        group.MapPut("/profile", async (
            [FromForm] string username,
            [FromForm] string phone,
            [FromForm] IFormFile? profileImage,
            DynamoUserService userService
        ) =>
        {

            string? profileImageUrl = null;
            if (profileImage is not null)
            {
                profileImageUrl = await FileHandler.SaveFileAsync(profileImage);
            }

            var updateUser = new UpdateUserDto(name: username, phone: phone, imageUrl: profileImageUrl);

            var result = await userService.UpdateProfile(updateUser);
            return result.ToHttpResult();
        })
        .DisableAntiforgery();


        return app;
    }
}