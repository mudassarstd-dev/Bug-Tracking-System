import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../common/ApiResponse';
import { ProjectAssigneeDto } from '../common/ProjectAssigneeDto';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { AvatarUser } from '../common/AvatarUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api_url = `${environment.taskManagerApi_base}/users`;

  constructor(private http: HttpClient) { }

  // getUsersByRole, for project creation (userId, avatar, username, role)

  getNotManagers() {
    return this.http.get<ApiResponse<ProjectAssigneeDto[]>>(`${this.api_url}/not-managers`)
      .pipe(
        tap(response => {
          console.log('Project assignees from backend:', response);
        })
      )
  }
  
  getProjectAssignees(projectId: string) {
    return this.http.get<ApiResponse<ProjectAssigneeDto[]>>(`${this.api_url}/assignees/${projectId}`)
      .pipe(
        tap(response => {
          console.log('Project assignees from backend:', response);
        })
      )
  }
  
  getDevelopers() {
    return this.http.get<ApiResponse<AvatarUser[]>>(`${this.api_url}/devs`)
      .pipe(
        tap(response => {
          console.log('Project assignees from backend:', response);
        })
      )
  }
}
