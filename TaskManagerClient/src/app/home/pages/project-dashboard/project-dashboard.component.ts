import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ProjectDialogComponent } from '../../dialogs/project-dialog/project-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {

  constructor(private authService: AuthService, private dialog: MatDialog, private projectService: ProjectService, private router: Router, private route: ActivatedRoute) { }

  isManager: boolean = false
  AddButtonText: string = "Add New Project"
  projects: any

  ngOnInit(): void {
    this.checkRole()
    this.getProjects()

  }

  openProjectDialog(project?: any) {

    console.log(`project data being passed from dashobard: ${project}`)
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (project) {
        this.projectService.updateProject(project.id, result).subscribe({
          next: () => {
            console.log('Project updated successfully');
            this.getProjects();
          }
        });
      } else {
        this.projectService.createProject(result).subscribe(resp => {
            this.getProjects();
        })
        console.log('Project data:', result);
      }
    });
  }

  navToDetails(project: any) {
    // this.router.navigate(['/home/bugs'])
    console.log(`got here with projectid: ${project.id}`)
    this.router.navigate([ `projects/${project.id}/bugs`]);
    localStorage.setItem("project-title", project.name)
  }

  private getProjects() {
    this.projectService.getAllProjects().subscribe({
      next: res => {
        this.projects = res.data
      }
    })
  }

  deleteProject(projectId: string) {
    this.projectService.deleteById(projectId).subscribe({
      next: res => {
        this.getProjects()
      }
    })
  }

  private checkRole() {
    if (this.authService.getRole() === "Manager") {
      this.isManager = true
      this.AddButtonText = "Add New Project"
    } else if (this.authService.getRole() === "Developer" || "QA") {
      this.isManager = false
      this.AddButtonText = "Add New Bug"
    } else {
      this.isManager = false
    }
  }
}
