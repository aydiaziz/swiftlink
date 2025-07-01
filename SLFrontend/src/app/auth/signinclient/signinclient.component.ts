import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signinclient',
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule,CommonModule],
  templateUrl: './signinclient.component.html',
  styleUrl: './signinclient.component.css'
})
export class SigninclientComponent implements OnInit {
    form: FormGroup;
    errorMessage = '';
    promoMessage = '';
  constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private route: ActivatedRoute,

    ) {
      // Création du formulaire avec validation
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      });
    }

  ngOnInit(): void {
    const promo = this.route.snapshot.queryParamMap.get('promo');
    if (promo === 'true') {
      this.promoMessage = 'Sign in with promotion code 1 free month';
    }
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

  redirectSignup() {
    this.router.navigate(['/signin'], {
      
    });
  }
}
