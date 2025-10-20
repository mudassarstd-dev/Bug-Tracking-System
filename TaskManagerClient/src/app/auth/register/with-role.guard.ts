import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WithRoleGuard implements CanActivate {
  canActivate() {
    if (localStorage.getItem("onboard-selected-role")) {
      return true;
    }
    return false;
  }
}
