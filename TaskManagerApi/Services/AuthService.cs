using System.Net.Http.Headers;
using IdentityDemo.IdentityService;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;

    public AuthService(AppDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<string> Login(LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Name == loginDto.name && u.Password == loginDto.password);
        if (user == null) return "Invalid creds";
        return _jwtService.GenerateToken(user);
    } 

    public async Task<ApiResponse<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        if (await _context.Users.AnyAsync(u => u.Name == registerDto.name)) return ApiResponse<AuthResponseDto>.Fail("User exists already");

         if (!Enum.TryParse<Role>(registerDto.role, true, out var role))
            {
                return ApiResponse<AuthResponseDto>.Fail("Invalid role");
            }

        var user = new User
            {
                Name = registerDto.name,
                Password = registerDto.password,  
                Role = role
            };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // return _jwtService.GenerateToken(user);
        return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto(user.Name, _jwtService.GenerateToken(user), user.Role.ToString()), message: "User registered successfully");
    }
}