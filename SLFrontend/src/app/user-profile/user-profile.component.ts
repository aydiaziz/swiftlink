import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

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
  selectedImageFile: File | null = null;
  profilePreview: string | ArrayBuffer | null = null;

  editingEmail = false;
  editingAddress = false;
  successMessage: string = '';
  errorMessage: string = '';

  BACKEND_URL = 'https://www.swift-helpers.com';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
    }, { validators: this.passwordMatchValidator });
  }

  get profileImageUrl(): string {
    return this.profilePreview
      ? this.profilePreview.toString()
      : (this.user?.profileImage ? `${this.BACKEND_URL}${this.user.profileImage}` : '/default-user.jpg');
  }

ngOnInit(): void {
  this.authService.getCurrentUser().subscribe(user => {
    this.user = user;
    
    this.profilePreview = user.profileImage ? `${this.BACKEND_URL}${user.profileImage}` : null;

    let address = '';

    // Si c’est un client
    if (user.role === 'Client' && user.client && user.client.address) {
      address = user.client.address;
      
    }

    // Si c’est un helper (workforce)
    if (user.role === '3rd Party' && user.workforce && user.workforce.address) {
      address = user.workforce.address;
      
    }

    this.form.patchValue({
      email: user.email,
      address: address
    });

    this.form.get('email')?.disable();
    this.form.get('address')?.disable();
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

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;

      // Prévisualisation immédiate
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formData = new FormData();

    const email = this.form.getRawValue().email;
    const address = this.form.getRawValue().address;

    if (email) formData.append('email', email);
    if (address) formData.append('address', address);

    // Mots de passe (si modifiés)
    if (this.form.value.oldPassword && this.form.value.newPassword) {
      formData.append('oldPassword', this.form.value.oldPassword);
      formData.append('newPassword', this.form.value.newPassword);
    }

    // Fichier image sélectionné
    if (this.selectedImageFile) {
      formData.append('profileImage', this.selectedImageFile);
    }

    this.authService.updateUserProfile(formData).subscribe({
      next: () => {
        this.successMessage = '✅ Profile updated successfully!';
        this.errorMessage = '';
        this.editingEmail = false;
        this.editingAddress = false;

        // Reset password fields
        this.form.get('oldPassword')?.reset();
        this.form.get('newPassword')?.reset();
        this.form.get('confirmPassword')?.reset();

        // Réinitialiser les champs modifiables
        this.form.get('email')?.disable();
        this.form.get('address')?.disable();

        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = '❌ Failed to update profile.';
        this.successMessage = '';
        console.error(err);
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }
}
