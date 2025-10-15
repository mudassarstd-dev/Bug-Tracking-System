import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { 
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Employee', Validators.required]
    })
  }

  registerForm: FormGroup
  loading = false
  successMessage = ""
  errorMessage = ""

  onSubmit() {
      if (this.registerForm.invalid) return;

      this.loading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: res => {
          this.loading = false
          
          if (res.success && res.data?.token) {
            localStorage.setItem("auth-token", res.data.token)
            localStorage.setItem("user-role", res.data.role)
            this.successMessage = res.message || "Registration successful!"
            this.errorMessage = ""
            this.registerForm.reset({role: "Employee"})
            this.navToHome()
          } else {
            this.successMessage = ""
            this.errorMessage = res.error || "Registration failed"
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
