import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, NgIf, RouterModule, ReactiveFormsModule],
  templateUrl: './signinhelper.component.html',
  styleUrls: ['./signinhelper.component.css']
})
export class SigninhelperComponent {
  form: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Création du formulaire avec validation
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
  if (this.form.invalid) {
    return;
  }

  const { email, password } = this.form.value;

  this.authService.signin({ email, password }).subscribe({
    next: (response) => {
      const role = response.role;
      const acces = response.acces || response.workforce?.acces;
      console.log(acces)
      if (role === 'Client') {
        this.router.navigate(['/']);
      } else if (role === '3rd Party') {
        if (acces !== 1) {
          this.errorMessage = 'Your profile is pending activation.';
          return;
        }
        this.router.navigate(['/helper-dashboard']);
      } else {
        this.errorMessage = 'Unauthorized role.';
      }
    },
    error: (err) => {
      const nonField = err.error?.non_field_errors;
      if (
        (Array.isArray(nonField) &&
          (nonField.includes('Invalid credentials.') ||
           nonField.includes('Invalid credentials') ||
           nonField.includes('User not found.')))
        || err.error?.error === 'Invalid credentials'
      ) {
        this.errorMessage = 'Email or password are wrong, try again.';
      } else {
        this.errorMessage = err?.error?.error || 'An error occurred, please try again.';
      }
    }
  });
}

}
