import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private apiUrl = environment.taskManagerApi_base

  constructor(private http: HttpClient) { }

  getEmps() {
  const token = localStorage.getItem("auth-token")
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/emps`, {headers})
  }

  createTask(task: {title: string, description: string, deadline: Date}) {
     const token = localStorage.getItem("auth-token")
     const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
  });
    return this.http.post(`${this.apiUrl}/tasks`, task, {headers})
  }
}