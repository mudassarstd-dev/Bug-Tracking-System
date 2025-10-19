using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Any;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models;

public class TaskService
{
    private readonly AppDbContext _context;
    private readonly IUser _user;

    public TaskService(AppDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<string> Create(TaskItemDto taskItemDto)
    {
        if (_user.Id == null) return "User unauthenticated";

        var creator = await _context.Users.FindAsync(_user.Id);
        if (creator == null || creator.Role != Role.Manager) return "Only manager can create tasks";

        if (taskItemDto.asssignedTo != null)
        {
            // create an assignment here
        }

        var newTask = new TaskItem
        {
            Title = taskItemDto.title,
            Description = taskItemDto.description,
            Status = TaskStatus.Draft,
            CreatedBy = creator.Id,
            UpdatedBy = creator.Id,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        await _context.Tasks.AddAsync(newTask);
        await _context.SaveChangesAsync();

        return "Created successfully";
    }

    // on delete, need to check assignment first
    public async Task<ApiResponse<string>> Delete(int taskItemId)
    {
        if (_user.Id == null) return ApiResponse<string>.Fail("User unauthenticated");

        var creator = await _context.Users.FindAsync(_user.Id);
        if (creator == null || creator.Role != Role.Manager) return ApiResponse<string>.Fail("Only managers can commit crimes here");

        var taskItem = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == taskItemId);

        if (taskItem == null || taskItem.CreatedBy != creator.Id) return ApiResponse<string>.Fail("A No-Go");

        _context.Tasks.Remove(taskItem);
        await _context.SaveChangesAsync();

        return ApiResponse<string>.Ok("Deleted successfully");
    }
    // public async Task<List<TaskItem>> GetManagerTasks()
    // {
    //     if (_user.Id == null) return [];
    //     return await _context.Tasks.Where(t => t.CreatedBy == _user.Id).ToListAsync();
    // }

    public async Task AssignTask(TaskAssignmentDto assignmentDto)
    {
        // lookup: task is not already assigned
        // other imp condition: emp (assignee must be under manager)

        var alreadyAssigned = await _context.Assignments.AnyAsync(a => a.AssignedTo == assignmentDto.assignedTo && a.TaskItemId == assignmentDto.taskItemId);
        if (alreadyAssigned) return;
        var emp = await _context.Users.Where(u => u.Id == assignmentDto.assignedTo).FirstOrDefaultAsync();
        if (emp == null) return;
        var task = await _context.Tasks.Where(u => u.Id == assignmentDto.taskItemId).FirstOrDefaultAsync();
        if (task == null) return;

        var newAssigment = TaskAssignment.Create(to: emp.Id, by: emp.Id, taskId: task.Id);

        await _context.Assignments.AddAsync(newAssigment);
        await _context.SaveChangesAsync();
    }


    // public async Task<ApiResponse<List<>>> GetEmps()
    // {
    //     var users = await _context.Users.Where(u => u.Role == Role.Employee).Select(u => new
    //     {
    //         id = u.Id,
    //         name = u.Name
    //     }).ToListAsync();
    //     return ApiResponse<List<User>>.Ok(users);
    // }


    // only manager can create task
}