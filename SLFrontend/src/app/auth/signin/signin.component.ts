import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, NgIf, RouterModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
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
        if (role === 'Client') {
          this.router.navigate(['/']);
        } else if (role === '3rd Party') {
          this.router.navigate(['/helper-dashboard']);
        }
      },
      error: (err) => {
        const serverMessage = err?.error?.non_field_errors?.[0];
        if (serverMessage) {
          this.errorMessage = 'Email or password are wrong, try again.';
        } else {
          this.errorMessage = 'An error occurred, please try again.';
        }
      }
    });
  }
}
