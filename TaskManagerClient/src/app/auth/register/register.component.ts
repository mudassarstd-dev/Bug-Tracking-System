import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{

  registerForm: FormGroup;
  hidePassword = true;
  hideConfirm = true;
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedRole: string = null

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

   ngOnInit() {
    this.selectedRole = localStorage.getItem("onboard-selected-role");
    console.log('Selected role:', this.selectedRole);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

    onSubmit() {
      if (this.registerForm.invalid) return;

      this.loading = true;

       const formValueWithRole = {
    ...this.registerForm.value,
    role: this.selectedRole || 'Developer'  
  };


      this.authService.register(formValueWithRole).subscribe({
        next: res => {
          this.loading = false
          if (res.success && res.data?.token) {
            localStorage.setItem("auth-token", res.data.token)
            localStorage.setItem("user-role", res.data.role)
            localStorage.removeItem("onboard-selected-role")
            this.successMessage = res.message || "Registration successful!"
            this.errorMessage = ""
            this.registerForm.reset({role: "Employee"})
            this.navToLogin()
          } else {
            this.successMessage = ""
            this.errorMessage = res.error || "Registration failed"
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
  navToLogin() {
     setTimeout(() => this.router.navigate(['/login']), 1000);
  }
}
