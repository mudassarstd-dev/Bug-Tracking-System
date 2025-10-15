import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  

   constructor(private authService: AuthService, private fb: FormBuilder) { 
      this.loginForm = this.fb.group({
        name: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    }  

    onSubmit() {
      
    }

}
