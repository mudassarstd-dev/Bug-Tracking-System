// import { Component, OnInit } from '@angular/core';
// import { AuthService } from '../auth.service';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.scss']
// })
// export class RegisterComponent {

//   constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) { 
//     this.registerForm = this.fb.group({
//       name: ['', Validators.required],
//       password: ['', [Validators.required, Validators.minLength(6)]],
//       role: ['Employee', Validators.required]
//     })
//   }

//   registerForm: FormGroup
//   loading = false
//   successMessage = ""
//   errorMessage = ""

//   onSubmit() {
//       if (this.registerForm.invalid) return;

//       this.loading = true;

//       this.authService.register(this.registerForm.value).subscribe({
//         next: res => {
//           this.loading = false
          
//           if (res.success && res.data?.token) {
//             localStorage.setItem("auth-token", res.data.token)
//             localStorage.setItem("user-role", res.data.role)
//             this.successMessage = res.message || "Registration successful!"
//             this.errorMessage = ""
//             this.registerForm.reset({role: "Employee"})
//             this.navToHome()
//           } else {
//             this.successMessage = ""
//             this.errorMessage = res.error || "Registration failed"
//           }
//         },
//         error: err => {
//           this.loading = false
//           this.errorMessage = "Something went wrong"
//           this.successMessage = ""
//           console.log(err)
//         }
//       })
//   }

//   
// }


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
            this.navToHome()
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
  navToHome() {
     setTimeout(() => this.router.navigate(['/home']), 1000);
  }
}
