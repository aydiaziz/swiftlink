import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NgChartsModule } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-office-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    NgChartsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterOutlet,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './office-dashboard.component.html',
  styleUrl: './office-dashboard.component.css'
})
export class OfficeDashboardComponent implements OnInit {
  form: FormGroup;
  errorMessage = '';
  isLoggedIn = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        if (user.role === 'Super Admin') {
          this.isLoggedIn = true;
        }
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }

  login() {
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.value;

    this.authService.loginSuperAdmin({ email, password }).subscribe({
      next: () => {
        this.isLoggedIn = true;
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
