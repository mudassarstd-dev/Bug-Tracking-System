
using TaskManagerApi.Data.Enums;

namespace TaskManagerApi.Data.Models;

public record RegisterDto(string name, string password, string role, string email, string phone);