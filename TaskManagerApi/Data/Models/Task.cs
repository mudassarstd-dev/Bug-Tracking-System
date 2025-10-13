using System.ComponentModel.DataAnnotations;

namespace TaskManagerApi.Data.Models;

public class TaskItem : AuditableEntity
{
    [Key]
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
}