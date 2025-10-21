import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ProjectDialogComponent } from '../../dialogs/project-dialog/project-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {

  constructor(private authService: AuthService, private dialog: MatDialog, private projectService: ProjectService, private userService: UserService, private router: Router) { }

  isManager: boolean = true
  AddButtonText: string = "Add New Project"
  projects: any
  // assignees: ProjectAssigneeDto[]

  ngOnInit(): void {
    this.checkRole()
    // this.userService.getNotManagers()

    // this.projects = [
    //   {
    //     id: 'p1',
    //     name: 'Website Redesign',
    //     description: 'Improve UI and add new components.',
    //     logoUrl: 'http://localhost:5153/uploads/project-logo.png',
    //     hover: false
    //   },
    //   {
    //     id: 'p2',
    //     name: 'API Migration',
    //     description: 'Migrate backend from legacy system.',
    //     logoUrl: 'http://localhost:5153/uploads/project-logo.png',
    //     hover: false
    //   },
    //   {
    //     id: 'p3',
    //     name: 'Mobile App',
    //     description: 'Build cross-platform Flutter app.',
    //     logoUrl: 'http://localhost:5153/uploads/project-logo.png',
    //     hover: false
    //   }
    // ];

    this.getProjects()

  }


  editProject(project: any) {
    this.openProjectDialog()
  }

  openProjectDialog() {

    // const assignees: ProjectAssigneeDto[] = [
    //   {
    //     Id: "u1",
    //     username: "alice.wong",
    //     avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    //     role: "admin",
    //   },
    //   {
    //     Id: "u2",
    //     username: "ben.smith",
    //     avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    //     role: "developer",
    //   },
    //   {
    //     Id: "u3",
    //     username: "carla.jones",
    //     avatar: "https://randomuser.me/api/portraits/women/21.jpg",
    //     role: "designer",
    //   },
    //   {
    //     Id: "u4",
    //     username: "david.ng",
    //     avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    //     role: "tester",
    //   },
    //   {
    //     Id: "u5",
    //     username: "emma.li",
    //     avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    //     role: "developer",
    //   },
    //   {
    //     Id: "u6",
    //     username: "frank.taylor",
    //     avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    //     role: "project_manager",
    //   },
    // ];

    // const dialogRef = this.dialog.open(ProjectDialogComponent, {
    //   data: { assignees }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     console.log('Project data:', result);
    //     this.projectService.createProject(result).subscribe({
    //       next: res => {
    //         this.getProjects()
    //       }
    //     })
    //   }
    // });

    this.userService.getNotManagers().subscribe({
      next: res => {
        const assignees = res.data || [];
        const dialogRef = this.dialog.open(ProjectDialogComponent, {
          data: { assignees }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.projectService.createProject(result).subscribe()
            console.log('Project data:', result);
          }
        });

      }
    })
  }

  navToDetails(projectTitle: string) {
      this.router.navigate(['/home/bugs'])
      localStorage.setItem("project-title", projectTitle)
  }


  private getProjects() {
    this.projectService.getAllProjects().subscribe({
      next: res => {
        this.projects = res.data
      }
    })
  }

  deleteProject(projectId: string) {
      console.log(` project id: ${projectId}`)
      this.projectService.deleteById(projectId).subscribe()
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
