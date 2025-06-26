import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Client, Workforce, WorkForceType,Gender,ClientType, MembershipType } from '../../models/user.model';
import { NgIf,NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports:[NgIf,FormsModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  userType: 'client' | 'workforce' = 'client';

  workForceTypes = Object.values(WorkForceType);
  genders = Object.values(Gender);
  clientTypes = Object.values(ClientType);
  membershipType: MembershipType | null = null;
  promoMessage = '';
  hasPromo = false;
  errorMessage = '';
  clientForm: Client = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    clientType: ClientType.INDIVIDUAL, 
    address: '',
    city: '',
    province: '',
    postalCode: '',
    phone: ''
  };

  workforceForm: Workforce = {
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    gender: Gender.MALE,
    driverLicence: '',
    driverLicenceExpiry: '',
    credentials: '',
    credentialsExpiry: '',
    training: '',
    workForceType: WorkForceType.EMPLOYEE,
    dateOfBirth: '',
    socialSecurityNumber: '',
    skills: '',
    address: '',
    workCategory: [],
    availability: {},
    hourlyRatebyService: 0,
    resume: null,
    yearsOfExperience:"",
    driverLicenceClass:""
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const m = params.get('membership');
      this.membershipType = (m as MembershipType) || null;
      const promo = params.get('promo');
      if (promo === 'true') {
        this.promoMessage = 'Sign-up with promotion code 1 free month';
        this.hasPromo = true;
      }
    });
  }

  onSignup() {
    if (this.userType === 'client') {
      this.clientForm.membershipType = this.membershipType || undefined;
      this.errorMessage = '';
      this.authService.signupClient(this.clientForm).subscribe({
        next: () => {
          this.authService.signin({
            email: this.clientForm.email,
            password: this.clientForm.password
          }).subscribe(() => {
            if (this.hasPromo) {
              alert('Your account is fully active. You have one free month');
            } else if (this.membershipType === MembershipType.PAY_PER_USE) {
              alert('Your account is now fully active. Your free month will begin when you place your first work order');
            } else {
              alert('Your account is now fully active. your membership fee will be added to your first job, which will also mark the start of your monthly membership period');
            }
            this.router.navigate(['/']);
          });
        },
        error: err => {
          const msg = JSON.stringify(err?.error || err).toLowerCase();
          if (msg.includes('already exists')) {
            this.errorMessage = 'you already have an account with us. Please sign in to continue';
          } else {
            this.errorMessage = 'An error occurred during signup.';
          }
        }
      });
    } else {
      this.errorMessage = '';
      this.authService.signupWorkforce(this.workforceForm).subscribe({
        next: () => {
          // ✅ Redirection vers dashboard si Helper, sinon Home
          if (this.workforceForm.workForceType === WorkForceType.PROFESSIONAL_HELPER ||
              this.workforceForm.workForceType === WorkForceType.GENERAL_HELPER) {
            this.router.navigate(['/helper-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: err => {
          const msg = JSON.stringify(err?.error || err).toLowerCase();
          if (msg.includes('already exists')) {
            this.errorMessage = 'you already have an account with us. Please sign in to continue';
          } else {
            this.errorMessage = 'An error occurred during signup.';
          }
        }
      });
    }
  }
}
