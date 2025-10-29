import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  private api_url = `${environment.taskManagerApi_base}/projects`;

  constructor(private http: HttpClient) { }

  createProject(data: FormData) {
    return this.http.post<ApiResponse<string>>(this.api_url, data);
  }

  getAllProjects() {
    return this.http.get<ApiResponse<any>>(this.api_url).pipe(
        tap(response => {
          console.log('Projects from backend:', response);
        })
      );
  }

  deleteById(id: string) {
    return this.http.delete<ApiResponse<any>>(`${this.api_url}/${id}`);
  }

  updateProject(projectId: string, data: FormData) {
    return this.http.put<ApiResponse<string>>(`${this.api_url}/${projectId}`, data);
  }

}