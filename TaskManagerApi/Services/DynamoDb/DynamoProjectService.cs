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
                    assignments.Add(new ProjectAssignment
                    {
                        UserId = user.Id,
                        Role = user.Role.ToString(),
                        ProjectId = project.Id
                    });
                }

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

    public async Task<ApiResponse<List<Project>>> GetByManagerAsync()
    {
        // verify manager here.
        var scan = _context.ScanAsync<Project>(new List<ScanCondition>());
        var projects = await scan.GetRemainingAsync();
        return ApiResponse<List<Project>>.Ok(projects);
    }

    // public async Task<ApiResponse<List<ProjectDto>>> GetAllAsync()
    // {
    //     var scan = _context.ScanAsync<Project>(new List<ScanCondition>());
    //     var projects = await scan.GetRemainingAsync();
    //     var projectDtos = new List<ProjectDto>();
    //     foreach (var project in projects)
    //     {
    //         var dto = new ProjectDto(
    //             id: project.Id,
    //             name: project.Name,
    //             description: project.Description,
    //             logoUrl: string.IsNullOrWhiteSpace(project.ImagePath) ? null : $"http://localhost:5153/uploads/{Path.GetFileName(project.ImagePath)}"
    //         );

    //         projectDtos.Add(dto);
    //     }
    //     return ApiResponse<List<ProjectDto>>.Ok(projectDtos);
    // }

    public async Task<ApiResponse<List<ProjectDto>>> GetAllAsync()
    {
        var projectDtos = new List<ProjectDto>();

        List<Project> projects = new();

        if (isManager())
        {
            var query = _context.QueryAsync<Project>(
                _user.Id,
                new QueryConfig { IndexName = "ManagerIdIndex" }
            );
            projects = await query.GetRemainingAsync();
        }
        else if (IsQaOrDev())
        {
            var assignedQuery = _context.QueryAsync<ProjectAssignment>(
                _user.Id,
                new QueryConfig { IndexName = "UserIdIndex" }
            );
            var assignments = await assignedQuery.GetRemainingAsync();
            var assignedProjectIds = assignments.Select(a => a.ProjectId).ToList();

            if (assignedProjectIds.Count > 0)
            {
                var batch = _context.CreateBatchGet<Project>();
                foreach (var pid in assignedProjectIds)
                    batch.AddKey(pid);

                await batch.ExecuteAsync();
                projects = batch.Results;
            }
        }
        else
        {
            var scan = _context.ScanAsync<Project>(new List<ScanCondition>());
            projects = await scan.GetRemainingAsync();
        }

        foreach (var project in projects)
        {
            int totalTasks = 0;
            int completedTasks = 0;

            var bugQuery = _context.QueryAsync<Bug>(
                project.Id,
                new QueryConfig { IndexName = "ProjectId-index" }
            );

            var bugs = await bugQuery.GetRemainingAsync();

            if (bugs.Any())
            {
                totalTasks = bugs.Count;
                completedTasks = bugs.Count(b => b.Status == BugStatus.Resolved);
            }

            // 3️⃣ Map to DTO
            var dto = new ProjectDto(
                id: project.Id,
                name: project.Name,
                description: project.Description,
                logoUrl: string.IsNullOrWhiteSpace(project.ImagePath)
                    ? null
                    : $"http://localhost:5153/uploads/{Path.GetFileName(project.ImagePath)}",
                totalTasks: totalTasks,
                completedTasks: completedTasks
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
        if (project == null)
            return ApiResponse<Project>.Fail("Project not found", ErrorCode.NotFound);

        if (!string.IsNullOrWhiteSpace(dto.Name))
            project.Name = dto.Name;
        if (dto.Description != null)
            project.Description = dto.Description;
        if (!string.IsNullOrWhiteSpace(dto.logoPath))
            project.ImagePath = dto.logoPath;

        if (dto.assigneeIds != null)
        {
            var query = _context.QueryAsync<ProjectAssignment>(
                projectId,
                new QueryConfig
                {
                    IndexName = "ProjectIdIndex"
                });

            var currentAssignments = await query.GetRemainingAsync();
            var currentUserIds = currentAssignments.Select(a => a.UserId).ToList();
            var newUserIds = dto.assigneeIds.Distinct().ToList();

            var toRemove = currentAssignments
                .Where(a => !newUserIds.Contains(a.UserId))
                .ToList();

            var toAddIds = newUserIds
                .Where(id => !currentUserIds.Contains(id))
                .ToList();

            if (toRemove.Any())
            {
                var deleteBatch = _context.CreateBatchWrite<ProjectAssignment>();
                deleteBatch.AddDeleteItems(toRemove);
                await deleteBatch.ExecuteAsync();
            }

            if (toAddIds.Any())
            {
                var newAssignments = new List<ProjectAssignment>();

                foreach (var userId in toAddIds)
                {
                    var user = await _context.LoadAsync<User>(userId);
                    if (user is not null)
                    {
                        newAssignments.Add(new ProjectAssignment
                        {
                            UserId = user.Id,
                            Role = user.Role.ToString(),
                            ProjectId = project.Id
                        });
                    }
                }

                if (newAssignments.Any())
                {
                    var addBatch = _context.CreateBatchWrite<ProjectAssignment>();
                    addBatch.AddPutItems(newAssignments);
                    await addBatch.ExecuteAsync();
                }
            }
        }

        await _context.SaveAsync(project);
        return ApiResponse<Project>.Ok(project, "Project updated successfully");
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

    private bool IsQaOrDev()
    {
        return _user?.Id != null &&
               (_user.Role == Role.QA.ToString() || _user.Role == Role.Developer.ToString());
    }

}
