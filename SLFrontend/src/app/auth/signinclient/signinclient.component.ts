import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signinclient',
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule,CommonModule],
  templateUrl: './signinclient.component.html',
  styleUrl: './signinclient.component.css'
})
export class SigninclientComponent {
    form: FormGroup;
    errorMessage = '';
  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      
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
      } else if (role === 'Super Admin') {
        this.router.navigate(['/office-dashboard']);
      }
    },
    error: (err) => {
      this.errorMessage = err?.error?.error || 'An error occurred, please try again.';
    }
  });
}

  redirectSignup() {
    this.router.navigate(['/signin'], {
      
    });
  }
}
