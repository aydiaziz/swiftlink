import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, NgIf, RouterModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSignin() {
    this.authService.signin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('✅ User signed in:', response);
        const role = response.role;
  
        if (role === 'Client') {
          this.router.navigate(['/']);
        } else if (role === '3rd Party') {
          this.router.navigate(['/helper-dashboard']);
        }
      },
      error: (err) => {
        console.error('❌ Signin error:', err);
        if (err.error && err.error.error) {
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = "An error occurred, please try again.";
        }
      }
    });
  }
  
}
