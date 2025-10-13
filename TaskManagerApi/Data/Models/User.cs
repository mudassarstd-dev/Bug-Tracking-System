using System.ComponentModel.DataAnnotations;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

namespace TaskManagerApi.Data.Models;

public class User
{
    [Key]
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Role { get; set; }
}