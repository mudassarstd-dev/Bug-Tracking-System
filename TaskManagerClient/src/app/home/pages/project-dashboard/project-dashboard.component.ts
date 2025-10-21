import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { ProjectDialogComponent } from '../../dialogs/project-dialog/project-dialog.component';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { ProjectAssigneeDto } from 'src/app/common/ProjectAssigneeDto';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent implements OnInit {

  constructor(private authService: AuthService, private dialog: MatDialog, private projectService: ProjectService, private userService: UserService) { }

  isManager: boolean = true
  AddButtonText: string = "Add New Project"
  projects: any
  // assignees: ProjectAssigneeDto[]

  ngOnInit(): void {
    // this.checkRole()
    // this.userService.getNotManagers()


    this.projects = [
      {
        id: 'p1',
        name: 'Website Redesign',
        description: 'Improve UI and add new components.',
        logoUrl: 'https://via.placeholder.com/150x150?text=Logo1',
        hover: false
      },
      {
        id: 'p2',
        name: 'API Migration',
        description: 'Migrate backend from legacy system.',
        logoUrl: 'http://localhost:5153/uploads/project-logo.png',
        hover: false
      },
      {
        id: 'p3',
        name: 'Mobile App',
        description: 'Build cross-platform Flutter app.',
        logoUrl: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.iconfinder.com%2Ficons%2F1807538%2Fphone_icon&psig=AOvVaw1ECQpAELfev4QfA1l3DVAa&ust=1761135989515000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKiLzPyktZADFQAAAAAdAAAAABAE',
        hover: false
      }
    ];


    // this.projectService.getAllProjects().subscribe({
    //   next: res => {
    //     this.projects = res.data
    //   }
    // })
  }



  openProjectDialog() {

    const assignees: ProjectAssigneeDto[] = [
      {
        Id: "u1",
        username: "alice.wong",
        avatar: "https://randomuser.me/api/portraits/women/68.jpg",
        role: "admin",
      },
      {
        Id: "u2",
        username: "ben.smith",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        role: "developer",
      },
      {
        Id: "u3",
        username: "carla.jones",
        avatar: "https://randomuser.me/api/portraits/women/21.jpg",
        role: "designer",
      },
      {
        Id: "u4",
        username: "david.ng",
        avatar: "https://randomuser.me/api/portraits/men/52.jpg",
        role: "tester",
      },
      {
        Id: "u5",
        username: "emma.li",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        role: "developer",
      },
      {
        Id: "u6",
        username: "frank.taylor",
        avatar: "https://randomuser.me/api/portraits/men/13.jpg",
        role: "project_manager",
      },
    ];

    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      data: { assignees }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Project data:', result);
        this.projectService.createProject(result).subscribe()
      }
    });

    // this.userService.getNotManagers().subscribe({
    //   next: res => {
    //     const assignees = res.data || [];
    //     const dialogRef = this.dialog.open(ProjectDialogComponent, {
    //       data: { assignees }
    //     });

    //     dialogRef.afterClosed().subscribe(result => {
    //       if (result) {
    //         this.projectService.createProject(result).subscribe()
    //         console.log('Project data:', result);
    //       }
    //     });

    //   }
    // })
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
