import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';  
import { ApiResponse } from '../common/ApiResponse';
import { AuthResponse } from '../common/AuthResponse';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  private api_url = `${environment.taskManagerApi_base}/auth`;

  login(creds: {email: string, password:string}) {
      return this.http.post<ApiResponse<AuthResponse>>(`${this.api_url}/login`, creds)
  }

  register(data: {name: string, password: string, role: string}) {
      return this.http.post<ApiResponse<AuthResponse>>(`${this.api_url}/register`, data)
  }

  logout() {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-role")
    localStorage.removeItem('user-name');
    localStorage.removeItem('user-image');
    this.router.navigate(['/login'])
  }

  getToken(): string | null {
    return localStorage.getItem('auth-token');
  }

  getRole(): string | null {
    return localStorage.getItem('user-role');
  }

  getUsername(): string | null {
    return localStorage.getItem('user-name');
  }
  
  getUserImage(): string | null {
    return localStorage.getItem('user-image');
  }

  isManager(): boolean {
    if (localStorage.getItem('user-role') == "Manager") return true
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}