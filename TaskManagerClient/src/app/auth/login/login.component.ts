import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { tokenName } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

    loginForm: FormGroup
    loading = false
    successMessage = ""
    errorMessage = ""
  

   constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { 
      this.loginForm = this.fb.group({
        name: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    }  

    onSubmit() {
      this.loading = true
      this.authService.login(this.loginForm.value).subscribe({
        next: res => {
          this.loading = false
          if (res.success && res.data?.token) {
            localStorage.setItem("auth-token", res.data.token)
            this.successMessage = res.message || "Logged in"
            this.errorMessage = ""
            this.navToHome()
          } else {
            this.successMessage = ""
            this.errorMessage = res.error || "Login failed"
          }
        }, 
        error: err => {
          this.loading = false
          this.errorMessage = "Something went wrong" 
          this.successMessage = ""
          console.log(err)
        }
      })
    }

  navToHome() {
     setTimeout(() => this.router.navigate(['/home']), 1000);
  }
}
