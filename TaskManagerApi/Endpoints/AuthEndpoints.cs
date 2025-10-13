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

        group.MapPost("/register", async (RegisterDto registerDto, AppDbContext db) =>
        {

            var user = new User
            {
                Name = registerDto.name,
                Role = registerDto.role
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Created($"/api/auth/{user.Id}", user);
        });

        // Example: get all users
        group.MapGet("/users", async (AppDbContext db) =>
            await db.Users.ToListAsync());

        return app;
    }
}
