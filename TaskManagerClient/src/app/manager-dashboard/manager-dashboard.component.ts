import { Component, OnInit } from '@angular/core';
import { MasterService } from '../services/master.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { TaskItemResponse } from '../common/TaskItemResponse';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  showTaskForm: boolean = false
  taskForm: FormGroup
  tasks: TaskItemResponse[] = []

  constructor(private masterService: MasterService, private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit(): void {
      this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: ['', Validators.required]
    });

    this.myTasks()
  }

  onSubmitTask() {
    if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched(); 
    return;
  }

    this.masterService.createTask(this.taskForm.value).subscribe({
      next: res => {
        this.showTaskForm = false
        this.taskForm.reset()
        alert(res)
      }
    })
  }

  myTasks() {
    this.masterService.getTasks().subscribe(tasks => this.tasks = tasks)
  }

  logout() {
    this.authService.logout();
  }

   toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm
  }
}