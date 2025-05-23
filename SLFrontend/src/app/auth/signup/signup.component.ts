import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Client, Workforce, WorkForceType,Gender,ClientType } from '../../models/user.model';
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
export class SignupComponent {
  userType: 'client' | 'workforce' = 'client';

  workForceTypes = Object.values(WorkForceType);
  genders = Object.values(Gender);
  clientTypes = Object.values(ClientType);
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
    hourlyRatebyService: 0
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    if (this.userType === 'client') {
      this.authService.signupClient(this.clientForm).subscribe(response => {
        console.log('Client created:', response);
        this.router.navigate(['/']);  // ✅ Redirection vers Home
      });
    } else {
      this.authService.signupWorkforce(this.workforceForm).subscribe(response => {
        console.log('Workforce created:', response);

        // ✅ Redirection vers dashboard si Helper, sinon Home
        if (this.workforceForm.workForceType === WorkForceType.PROFESSIONAL_HELPER || 
            this.workforceForm.workForceType === WorkForceType.GENERAL_HELPER) {
          this.router.navigate(['/helper-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }
}
