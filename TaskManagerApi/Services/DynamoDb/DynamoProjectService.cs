using System.Data;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Runtime;
using Microsoft.IdentityModel.Tokens;
using TaskManagerApi.Data.Enums;
using TaskManagerApi.Data.Models.Dynamo;
using TaskManagerApi.helper;

public class DynamoProjectService
{
    private readonly IDynamoDBContext _context;
    private readonly IUser _user;

    public DynamoProjectService(IDynamoDBContext context, IUser user)
    {
        _context = context;
        _user = user;
    }
    // ONLY MANAGER
    public async Task<ApiResponse<Project>> CreateProjectAsync(CreateProjectDto dto)
    {
        if (!isManager())
            return ApiResponse<Project>.Fail("Manager Only operation", ErrorCode.InvalidCredentials);

        if (string.IsNullOrWhiteSpace(dto.Name))
            return ApiResponse<Project>.Fail("Project name is required", ErrorCode.ValidationError);

        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            ManagerId = _user.Id,
            ImagePath = dto.logoPath
        };

        if (dto.assigneeIds != null)
        {
            var users = new List<User>();

            foreach (var id in dto.assigneeIds)
            {
                var user = await _context.LoadAsync<User>(id);
                if (user is not null) users.Add(user);
            }

            if (!users.IsNullOrEmpty())
            {
                var assignments = new List<ProjectAssignment>();

                foreach (var user in users)
                {
                    // check if not already assigned
                    assignments.Add(new ProjectAssignment
                    {
                        UserId = user.Id,
                        Role = user.Role.ToString(),
                        ProjectId = project.Id
                    });
                }

                // writing assignment batch to db
                var batch = _context.CreateBatchWrite<ProjectAssignment>();
                batch.AddPutItems(assignments);
                await batch.ExecuteAsync();
            }
        }

        await _context.SaveAsync(project);
        return ApiResponse<Project>.Ok(project, "Project created successfully");
    }

    public async Task<ApiResponse<Project>> GetByIdAsync(string projectId)
    {
        var project = await _context.LoadAsync<Project>(projectId);
        return project != null ? ApiResponse<Project>.Ok(project) : ApiResponse<Project>.Fail("Project not found", ErrorCode.NotFound);
    }

    // get only projects created by manager
    public async Task<ApiResponse<List<Project>>> GetByManagerAsync()
    {
        // verify manager here.
        var scan = _context.ScanAsync<Project>(new List<ScanCondition>());
        var projects = await scan.GetRemainingAsync();
        return ApiResponse<List<Project>>.Ok(projects);
    }

    public async Task<ApiResponse<List<ProjectDto>>> GetAllAsync()
    {
        var scan = _context.ScanAsync<Project>(new List<ScanCondition>());
        var projects = await scan.GetRemainingAsync();
        var projectDtos = new List<ProjectDto>();

        foreach (var project in projects)
        {
            var dto = new ProjectDto(
                id: project.Id,
                name: project.Name,
                description: project.Description,
                logoUrl: string.IsNullOrWhiteSpace(project.ImagePath) ? null : $"http://localhost:5153//uploads/{Path.GetFileName(project.ImagePath)}"
            );

            projectDtos.Add(dto);
        }
        return ApiResponse<List<ProjectDto>>.Ok(projectDtos);
    }

    // ONLY MANAGER
    public async Task<ApiResponse<Project>> UpdateProjectAsync(string projectId, UpdateProjectDto dto)
    {
        if (!isManager())
            return ApiResponse<Project>.Fail("Manager Only operation", ErrorCode.InvalidCredentials);

        var project = await _context.LoadAsync<Project>(projectId);
        if (project == null) return ApiResponse<Project>.Fail("Project not found", ErrorCode.NotFound);

        if (!string.IsNullOrWhiteSpace(dto.Name)) project.Name = dto.Name;
        if (dto.Description != null) project.Description = dto.Description;

        await _context.SaveAsync(project);
        return ApiResponse<Project>.Ok(project, "Project updated");
    }

    // ONLY MANAGER
    public async Task<ApiResponse<bool>> DeleteProjectAsync(string projectId)
    {
        if (!isManager())
            return ApiResponse<bool>.Fail("Manager Only operation", ErrorCode.InvalidCredentials);

        var project = await _context.LoadAsync<Project>(projectId);
        if (project == null) return ApiResponse<bool>.Fail("Project not found", ErrorCode.NotFound);

        // check if there are any active assignments to project then re-ask (on confirmation, add new endpoint with deletion of assignments, supported)

        await _context.DeleteAsync<Project>(projectId);
        return ApiResponse<bool>.Ok(true, "Project deleted");
    }

    private bool isManager()
    {
        if (_user.Id == null || _user.Role != Role.Manager.ToString()) return false;
        return true;
    }
}
