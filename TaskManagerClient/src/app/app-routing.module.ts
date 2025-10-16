import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { EmpDashboardComponent } from './emp-dashboard/emp-dashboard.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { RoleGuard } from './auth/role.guard';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [ AuthGuard ] },
  { path: 'e-dash', component: EmpDashboardComponent, canActivate: [ AuthGuard, RoleGuard ], data: {role: "Employee"} },
  { path: 'm-dash', component: ManagerDashboardComponent, canActivate: [ AuthGuard, RoleGuard ], data: {role: "Manager"} },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }