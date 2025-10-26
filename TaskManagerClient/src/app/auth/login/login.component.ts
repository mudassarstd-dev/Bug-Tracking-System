import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { tokenName } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup
    loading = false
    successMessage = ""
    errorMessage = ""
    hide: boolean = true
  

   constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { 
      this.loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email] ],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    }  
  ngOnInit(): void {
    this.authService.logout()
  }

    onSubmit() {
      if (this.loginForm.invalid) return

      this.loading = true
      this.authService.login(this.loginForm.value).subscribe({
        next: res => {
          this.loading = false
          if (res.success && res.data?.token) {
            localStorage.setItem("auth-token", res.data.token)
            localStorage.setItem("user-role", res.data.role)
            localStorage.setItem("user-name", res.data.username)
            localStorage.setItem("user-image", res.data.profileImageUrl)
            this.successMessage = res.message || "Logged in"
            this.errorMessage = ""
            this.navToDash(res.data.role)
          } else {
            this.successMessage = ""
            this.errorMessage = res.error || "Login failed"
          }
        }, 
        error: err => {
            this.loading = false;
            this.successMessage = "";

            if (err.error && err.error.error) {
              this.errorMessage = err.error.error; 
            } else if (err.message) {
              this.errorMessage = err.message;
            } else {
              this.errorMessage = "Something went wrong";
            }
    }
      })
    }

  navToDash(role: string) {
    setTimeout(() => this.router.navigate(['/']), 1000);
  }
}
