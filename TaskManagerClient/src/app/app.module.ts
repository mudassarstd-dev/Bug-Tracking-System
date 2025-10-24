import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { OnBoardComponent } from './on-board/on-board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ProjectDashboardComponent } from './home/pages/project-dashboard/project-dashboard.component';
import { ProjectDialogComponent } from './home/dialogs/project-dialog/project-dialog.component';
import { BugListComponent } from './home/pages/bug-list/bug-list.component';
import { BugDialogComponent } from './home/dialogs/bug-dialog/bug-dialog.component';
import { ProfileComponent } from './home/profile/profile.component';
import { UpdateBugDialogComponent } from './home/dialogs/update-bug-dialog/update-bug-dialog.component';
import { NotificationPanelComponent } from './shared/notification-panel/notification-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    OnBoardComponent,
    ProjectDashboardComponent,
    ProjectDialogComponent,
    BugListComponent,
    BugDialogComponent,
    ProfileComponent,
    UpdateBugDialogComponent,
    NotificationPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
