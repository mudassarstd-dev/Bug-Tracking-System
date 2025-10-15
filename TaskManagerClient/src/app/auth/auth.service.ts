import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';  // 👈 import here
import { ApiResponse } from '../common/ApiResponse';
import { AuthResponse } from '../common/AuthResponse';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

private api_url = `${environment.taskManagerApi_base}/auth`;

  login(creds: {name: string, password:string}) {
      return this.http.post<ApiResponse<AuthResponse>>(`${this.api_url}/login`, creds)
  }

  register(data: {name: string, password: string, role: string}) {
      return this.http.post<ApiResponse<AuthResponse>>(`${this.api_url}/register`, data)
  }
}