using System.Data;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

namespace TaskManagerApi.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/register", async (RegisterDto registerDto, AuthService authService) =>
        {
            return (await authService.Register(registerDto)).ToHttpResult();
        });

        group.MapPost("login", async (LoginDto loginDto, AuthService authService) =>
        {
            return TypedResults.Ok( await authService.Login(loginDto));
        });

        group.MapGet("/users", async (AppDbContext db) =>
            await db.Users.ToListAsync<User>());

        return app;
    }
}