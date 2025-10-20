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

  isManager: boolean = false
  AddButtonText: string = "Add New Project"
  projects: any
  // assignees: ProjectAssigneeDto[]

  ngOnInit(): void {
    this.checkRole()
    // this.userService.getNotManagers()

    this.projectService.getAllProjects().subscribe({
      next: res => {
        this.projects = res.data
      }
    })
  }

  //  cards = [
  //   {
  //     icon: 'group',
  //     title: 'Manager',
  //     description: 'Work seamlessly with your team in real-time.',
  //     hover: false,
  //   },
  //   {
  //     icon: 'check_circle',
  //     title: 'Developer',
  //     description: 'Keep track of every task and deadline efficiently.',
  //     hover: false,
  //   },
  //   {
  //     icon: 'insights',
  //     title: 'QA',
  //     description: 'Visualize your achievements and performance.',
  //     hover: false,
  //   }
  // ];

  openProjectDialog() {

      this.userService.getNotManagers().subscribe({
        next: res => {
          const assignees = res.data || [];
          const dialogRef = this.dialog.open(ProjectDialogComponent, {
          data: { assignees }
      });

      dialogRef.afterClosed().subscribe(result => {
          if(result) {
            this.projectService.createProject(result).subscribe()
             console.log('Project data:', result);
          }
      });

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
