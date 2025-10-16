import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot) {

    const expectedRole = route.data['role']
    const userRole = this.authService.getRole()

    if (this.authService.isLoggedIn() && userRole === expectedRole) 
    {
      return true;
    }
    return false;
  }
}