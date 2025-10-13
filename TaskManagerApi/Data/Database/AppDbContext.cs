using Microsoft.EntityFrameworkCore;
using TaskManagerApi.Data.Models;

namespace TaskManagerApi.Data.Database;

public class AppDbContext: DbContext
{

  public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();   
    public DbSet<TaskAssignment> Assignments => Set<TaskAssignment>();   
}