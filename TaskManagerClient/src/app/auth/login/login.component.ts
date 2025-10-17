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
    hide: boolean = false
  

   constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { 
      this.loginForm = this.fb.group({
        name: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    }  
  ngOnInit(): void {
    this.authService.logout()
  }

    onSubmit() {
      this.loading = true
      this.authService.login(this.loginForm.value).subscribe({
        next: res => {
          this.loading = false
          if (res.success && res.data?.token) {
            localStorage.setItem("auth-token", res.data.token)
            localStorage.setItem("user-role", res.data.role)
            this.successMessage = res.message || "Logged in"
            this.errorMessage = ""
            this.navToDash(res.data.role)
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

  navToDash(role: string) {
    if (role === "Manager") {
      setTimeout(() => this.router.navigate(['/m-dash']), 1000); 
    } else {
      setTimeout(() => this.router.navigate(['/e-dash']), 1000);
    }
  }
}
