import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  profileForm!: FormGroup;
  isLoading = true;
  selectedFile?: File;
  previewUrl?: string;

  constructor(private fb: FormBuilder, private userService: UserService) { }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      phone: [''],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      password: [{ value: '', disabled: true }]
    });

    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        const user = res.data;
        this.profileForm.patchValue({
          username: user.name,
          phone: user.phone,
          email: user.email,
          password: ''
        });
        this.previewUrl = user.imageUrl;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user profile:', err);
        this.isLoading = false;
      }
    });
  }

  onFileClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onConfirm(): void {
    if (this.profileForm.valid) {
      const formData = new FormData();
      formData.append('username', this.profileForm.get('username')?.value);
      formData.append('phone', this.profileForm.get('phone')?.value);
      formData.append('email', this.profileForm.get('email')?.value);
      formData.append('password', this.profileForm.get('password')?.value);
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }

      this.userService.updateUserProfile(formData).subscribe({
        next: (res) => {
          console.log('Profile updated successfully:', res);
          alert('Profile updated!');
        },
        error: (err) => {
          console.error('Profile update failed:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.loadUserProfile();
  }
}
