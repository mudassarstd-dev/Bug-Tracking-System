import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {


  private api_url = `${environment.taskManagerApi_base}/projects`;
  
  constructor(private http: HttpClient) { }

  // createProject

  createProject(data: FormData) {
    return this.http.post<ApiResponse<string>>(this.api_url, data);
  }

  getAllProjects() {
      return this.http.get<ApiResponse<any>>(this.api_url);
  }

}