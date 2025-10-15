import { Component, OnInit } from '@angular/core';
import { MasterService } from '../services/master.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  showTaskForm: boolean = false
  employees: string[] = []
  taskForm : FormGroup
  isManager: boolean = false

  constructor(private masterSerivce: MasterService, private fb: FormBuilder) { }

  ngOnInit(): void {
      this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      deadline: ['', Validators.required]
    });

    let userRole = localStorage.getItem("user-role")
    if (userRole === "Manager") {
      this.isManager = true
    }
  }
  
  onSubmitTask() {
     if (this.taskForm.invalid) {
    this.taskForm.markAllAsTouched(); // show all validation messages
    return;
  }
    // implement proper error handling in here
    this.masterSerivce.createTask(this.taskForm.value).subscribe()
  }

  toggleTaskForm() {
    this.showTaskForm = !this.showTaskForm
  }

  GetEmployees() {
    this.masterSerivce.getEmps().subscribe({
      next: res => {
        this.employees = res.data
      }
    })
  }

   GetDummyEmployees() {
    this.employees = [
      'John Doe' ,
      'Jane Smith',
      'Robert Brown'
    ];
  }
}
