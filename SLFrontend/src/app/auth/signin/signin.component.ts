import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MembershipService, Membership } from '../../services/membership.service';


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterModule, ReactiveFormsModule,NgFor,CommonModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  form: FormGroup;
  errorMessage = '';
  memberships: Membership[] = [];
  selectedMembership = '';
  promotionCode = '';
  promoError = '';
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private membershipService: MembershipService
  ) {
    // Création du formulaire avec validation
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.membershipService.getMemberships().subscribe(data => {
      this.memberships = data;
      if (data.length) {
        this.selectedMembership = data[0].membershipType;
      }
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
    this.router.navigate(['/signup'], {
      queryParams: { membership: this.selectedMembership }
    });
  }

  applyPromo() {
    const code = this.promotionCode.trim().toLowerCase();
    const valid = this.memberships.some(m =>
      m.promotionCode && m.promotionCode.trim().toLowerCase() === code
    );
    if (valid) {
      this.router.navigate(['/signup'], {
        queryParams: {
          promo: 'true',
          membership: this.selectedMembership
        }
      });
    } else {
      this.promoError = 'Invalid promotion code';
    }
  }

  onSignIn() {
    const code = this.promotionCode.trim().toLowerCase();
    const valid = this.memberships.some(m =>
      m.promotionCode && m.promotionCode.trim().toLowerCase() === code
    );
    const queryParams = valid ? { promo: 'true' } : {};
    this.router.navigate(['/signin-client'], { queryParams });
  }
}
