import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../common/ApiResponse';
import { ProjectAssigneeDto } from '../common/ProjectAssigneeDto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api_url = `${environment.taskManagerApi_base}/users`;

  constructor(private http: HttpClient) { }

  // getUsersByRole, for project creation (userId, avatar, username, role)

  getNotManagers() {
    return this.http.get<ApiResponse<ProjectAssigneeDto[]>>(`${this.api_url}/not-managers`)
  }
}
