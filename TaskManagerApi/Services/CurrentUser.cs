using System.Security.Claims;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _context;

    public CurrentUser(IHttpContextAccessor context)
        => _context = context;

    public string? Id => _context.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? Role => _context.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);

}
