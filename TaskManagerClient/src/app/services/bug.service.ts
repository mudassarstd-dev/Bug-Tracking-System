import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../common/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class BugService {

  private api_url = `${environment.taskManagerApi_base}/bugs`

  constructor(private http: HttpClient) { }

  create(data: FormData) {
      return this.http.post<ApiResponse<any>>(this.api_url, data)
  }
}
