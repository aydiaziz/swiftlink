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
    hourlyRatebyService: 0,
    yearsOfExperience:"",
    resume: null
  };

  constructor(private authService: AuthService, private router: Router) {}

onSignup(): void {
  if (this.userType === 'client') {
    this.authService.signupClient(this.clientForm).subscribe({
      next: response => {
        console.log('Client created:', response);
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Client signup failed:', err);
      }
    });
  } else {
    const formData = new FormData();

    // ✅ Nested user object as JSON
    const userObj = {
      email: this.workforceForm.email,
      username: this.workforceForm.email,
      first_name: this.workforceForm.firstName,
      last_name: this.workforceForm.lastName,
      password: this.workforceForm.password,
      entityId: 1
    };
    formData.append('UserId', JSON.stringify(userObj));

    // ✅ Basic fields
    formData.append('entityID', '1');
    formData.append('phone', this.workforceForm.phone || '');
    formData.append('gender', this.workforceForm.gender || '');
    formData.append('driverLicence', this.workforceForm.driverLicence || '');
    formData.append('training', this.workforceForm.training || '');
    formData.append('workForceType', this.workforceForm.workForceType);
    formData.append('address', this.workforceForm.address || '');
    formData.append('credentials', this.workforceForm.credentials || '');
    formData.append('skills', this.workforceForm.skills || '');
    formData.append('hourlyRatebyService', (this.workforceForm.hourlyRatebyService ?? '0').toString());

    // ✅ Optional fields
    if (this.workforceForm.resume) {
      formData.append('resume', this.workforceForm.resume);
    }

    if (this.workforceForm.yearsOfExperience) {
      formData.append('yearsOfExperience', this.workforceForm.yearsOfExperience);
    }

    if (this.workforceForm.socialSecurityNumber) {
      formData.append('socialSecurityNumber', this.workforceForm.socialSecurityNumber);
    }

    // ✅ Handle date fields safely
    const parseDate = (value: string | null | undefined): string | undefined => {
      if (!value) return undefined;
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
    };

    const dob = parseDate(this.workforceForm.dateOfBirth);
    const credExp = parseDate(this.workforceForm.credentialsExpiry);
    const licenceExp = this.workforceForm.driverLicence === 'Yes'
      ? parseDate(this.workforceForm.driverLicenceExpiry)
      : undefined;

    if (dob) formData.append('dateOfBirth', dob);
    if (credExp) formData.append('credentialsExpiry', credExp);
    if (licenceExp) formData.append('driverLicenceExpiry', licenceExp);

    // ✅ workCategory[]
    if (Array.isArray(this.workforceForm.workCategory)) {
      this.workforceForm.workCategory.forEach(cat => {
        formData.append('workCategory[]', cat.toString());
      });
    }

    // ✅ availability (object as JSON string)
    if (this.workforceForm.availability) {
      formData.append('availability', JSON.stringify(this.workforceForm.availability));
    }

    // ✅ Submit workforce signup
    this.authService.signupWorkforce1(formData).subscribe({
      next: response => {
        console.log('Workforce created:', response);

        const type = this.workforceForm.workForceType;
        if (type === WorkForceType.PROFESSIONAL_HELPER || type === WorkForceType.GENERAL_HELPER) {
          this.router.navigate(['/helper-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        console.error('Workforce signup failed:', err);
      }
    });
  }
}


}
