import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';
import { OnBoardComponent } from './on-board/on-board.component';
import { WithRoleGuard } from './auth/register/with-role.guard';
import { ProjectDashboardComponent } from './home/pages/project-dashboard/project-dashboard.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: 'dashboard', component: ProjectDashboardComponent }
    ]
  },
  { path: 'register', component: RegisterComponent, canActivate: [ WithRoleGuard ] },
  { path: 'login', component: LoginComponent },
  { path: 'onBoard', component: OnBoardComponent },
  // { path: 'home', component: HomeComponent },
  // { path: 'e-dash', component: EmpDashboardComponent, canActivate: [ AuthGuard, RoleGuard ], data: {role: "Employee"} },
  // { path: 'm-dash', component: ManagerDashboardComponent, canActivate: [ AuthGuard, RoleGuard ], data: {role: "Manager"} },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }