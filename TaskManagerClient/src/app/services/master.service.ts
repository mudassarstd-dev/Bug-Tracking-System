import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';
import { TaskItemResponse } from '../common/TaskItemResponse';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private apiUrl = environment.taskManagerApi_base

  constructor(private http: HttpClient) { }

  getEmps() {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/tasks/emps`)
  }

  createTask(task: {title: string, description: string, deadline: Date}) {
    return this.http.post(`${this.apiUrl}/tasks`, task)
  }

  getTasks() {
      return this.http.get<TaskItemResponse[]>(`${this.apiUrl}/tasks`);
  }
}