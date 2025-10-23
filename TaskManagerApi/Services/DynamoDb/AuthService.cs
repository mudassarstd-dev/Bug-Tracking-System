using Amazon.DynamoDBv2.DataModel;
using IdentityDemo.IdentityService;
using TaskManagerApi.Data.Models.Dynamo;
using TaskManagerApi.Data.Models;
using TaskManagerApi.Data.Enums;

public class DynamoAuthService
{
    private readonly IDynamoDBContext _context;
    private readonly JwtService _jwtService;

    public DynamoAuthService(IDynamoDBContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
    {
        try
        {
            var existingUser = await GetUserByEmailAsync(registerDto.email);
            if (existingUser != null)
                return ApiResponse<AuthResponseDto>.Fail("User with this email already exists.", ErrorCode.UserExists);

            if (!Enum.TryParse<Role>(registerDto.role, true, out var role))
                return ApiResponse<AuthResponseDto>.Fail("Invalid role", ErrorCode.InvalidRole);

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = registerDto.name,
                Email = registerDto.email,
                Phone = registerDto.phone,
                Role = registerDto.role,
                Password = PasswordHasher.HashPassword(registerDto.password)
            };

            await _context.SaveAsync(user);

            var token = _jwtService.GenerateToken(user);

            var authResponse = new AuthResponseDto(user.Name, token, user.Role, null);
            return ApiResponse<AuthResponseDto>.Ok(authResponse, "User registered successfully");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.Fail(ex.Message, ErrorCode.Unknown);
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto)
    {
        try
        {
            if (String.IsNullOrWhiteSpace(loginDto.email) || String.IsNullOrWhiteSpace(loginDto.password))
                return ApiResponse<AuthResponseDto>.Fail("Email or password cannot be null or empty", ErrorCode.ValidationError);

            var user = await GetUserByEmailAsync(loginDto.email);
            if (user == null || !PasswordHasher.VerifyPassword(loginDto.password, user.Password))
                return ApiResponse<AuthResponseDto>.Fail("Invalid email or password", ErrorCode.InvalidCredentials);

            var token = _jwtService.GenerateToken(user);


            var imageUrl = string.IsNullOrWhiteSpace(user.ProfileImageUrl)
                        ? null
                        : $"http://localhost:5153/uploads/{Path.GetFileName(user.ProfileImageUrl)}";

            var authResponse = new AuthResponseDto(user.Name, token, user.Role, imageUrl);
            return ApiResponse<AuthResponseDto>.Ok(authResponse, "Login successful");
        }
        catch (Exception ex)
        {
            return ApiResponse<AuthResponseDto>.Fail(ex.Message, ErrorCode.Unknown);
        }
    }

    private async Task<User?> GetUserByEmailAsync(string email)
    {
        var query = _context.QueryAsync<User>(email, new QueryConfig
        {
            IndexName = "Emailindex"
        });

        var users = await query.GetRemainingAsync();
        return users.FirstOrDefault();
    }
}