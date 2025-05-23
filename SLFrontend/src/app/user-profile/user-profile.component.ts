import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  form: FormGroup;
  user: any;
  profilePreview: string | ArrayBuffer | null = null;

  editingEmail = false;
  editingAddress = false;
  successMessage: string = '';
errorMessage: string = '';

constructor(private fb: FormBuilder, private authService: AuthService) {
  this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required],
    oldPassword: [''],
    newPassword: [''],
    confirmPassword: [''],
    profileImage: [null]
  }, { validators: this.passwordMatchValidator });
}
BACKEND_URL = environment.apiUrl;

get profileImageUrl(): string {
  return this.user?.profileImage
    ? `${this.BACKEND_URL}${this.user.profileImage}`
    : '/default-user.jpg';
}
  ngOnInit(): void {
  this.authService.getCurrentUser().subscribe(user => {
    this.user = user;
    console.log('User from API:', user);
    this.profilePreview = user.profileImage;
    console.log(this.profilePreview);
    

    this.form.patchValue({
      email: user.email,
      address: user.address || ''
    });
  });
}

  toggleEdit(field: 'email' | 'address'): void {
    if (field === 'email') {
      this.editingEmail = true;
      this.form.get('email')?.enable();
    } else if (field === 'address') {
      this.editingAddress = true;
      this.form.get('address')?.enable();
    }
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass && confirmPass && newPass !== confirmPass ? { passwordMismatch: true } : null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.form.patchValue({ profileImage: file });

      const reader = new FileReader();
      reader.onload = () => this.profilePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
  
    const formData = new FormData();
    formData.append('email', this.form.getRawValue().email);
    formData.append('address', this.form.getRawValue().address);
  
    if (this.form.value.oldPassword && this.form.value.newPassword) {
      formData.append('oldPassword', this.form.value.oldPassword);
      formData.append('newPassword', this.form.value.newPassword);
    }
  
    if (this.form.value.profileImage) {
      formData.append('profileImage', this.form.value.profileImage);
    }
  
    this.authService.updateClientProfile(formData).subscribe({
      next: () => {
        this.successMessage = '✅ Profile updated successfully!';
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 4000); // Auto-dismiss
      },
      error: () => {
        this.errorMessage = '❌ Failed to update profile.';
        this.successMessage = '';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
  
}
