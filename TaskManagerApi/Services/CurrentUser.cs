using System.Security.Claims;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _context;

    public CurrentUser(IHttpContextAccessor context)
        => _context = context;

    public int? Id =>
        int.TryParse(
            _context.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier),
            out var id
        )
        ? id
        : null;
}
