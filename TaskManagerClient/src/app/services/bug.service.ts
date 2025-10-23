import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';
import { BugDetails } from '../common/BugDetails';

@Injectable({
  providedIn: 'root'
})
export class BugService {

  private api_url = `${environment.taskManagerApi_base}/bugs`

  constructor(private http: HttpClient) { }

  create(data: FormData) {
      return this.http.post<ApiResponse<any>>(this.api_url, data)
  }

  getBugDetails(projectId: string) {
    return this.http.get<ApiResponse<BugDetails[]>>(`${this.api_url}/${projectId}`)
  }

  delete(bugId: string) {
    return this.http.delete<ApiResponse<any>>(`${this.api_url}/${bugId}`)
  }
}
