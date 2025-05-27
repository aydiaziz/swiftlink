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

 onSignup() {
  if (this.userType === 'client') {
    this.authService.signupClient(this.clientForm).subscribe(response => {
      console.log('Client created:', response);
      this.router.navigate(['/']);
    });
  } else {
    // ✅ Convert workforceForm to FormData
    const formData = new FormData();

    // UserId fields (nested object)
    formData.append('UserId.email', this.workforceForm.email);
    formData.append('UserId.username', this.workforceForm.email);
    formData.append('UserId.first_name', this.workforceForm.firstName);
    formData.append('UserId.last_name', this.workforceForm.lastName);
    formData.append('UserId.password', this.workforceForm.password);
    formData.append('UserId.entityId', '1');

    // Main fields
    formData.append('entityID', '1');
    formData.append('phone', this.workforceForm.phone || '');
    formData.append('gender', this.workforceForm.gender);
    formData.append('driverLicence', this.workforceForm.driverLicence || '');
    formData.append('training', this.workforceForm.training || '');
    formData.append('workForceType', this.workforceForm.workForceType);
    formData.append('address', this.workforceForm.address || '');
    formData.append('credentials', this.workforceForm.credentials || '');
    formData.append('skills', this.workforceForm.skills || '');
    formData.append('hourlyRatebyService', this.workforceForm.hourlyRatebyService?.toString() || '0');

    // Optional fields
    if (this.workforceForm.resume) {
      formData.append('resume', this.workforceForm.resume);
    }

    if (this.workforceForm.yearsOfExperience) {
      formData.append('yearsOfExperience', this.workforceForm.yearsOfExperience);
    }

    if (this.workforceForm.socialSecurityNumber) {
      formData.append('socialSecurityNumber', this.workforceForm.socialSecurityNumber);
    }

    // Dates
  const parseDate = (value: string | undefined): string | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  };

    const dob = parseDate(this.workforceForm.dateOfBirth);
    const credExp = parseDate(this.workforceForm.credentialsExpiry);
    const licenceExp = this.workforceForm.driverLicence === 'Yes' && this.workforceForm.driverLicenceExpiry
      ? parseDate(this.workforceForm.driverLicenceExpiry)
      : null;

    if (dob) formData.append('dateOfBirth', dob);
    if (credExp) formData.append('credentialsExpiry', credExp);
    if (licenceExp) formData.append('driverLicenceExpiry', licenceExp);

    // workCategory[]
    if (Array.isArray(this.workforceForm.workCategory)) {
      this.workforceForm.workCategory.forEach(cat => {
        formData.append('workCategory[]', cat.toString());
      });
    }

    // availability
    if (this.workforceForm.availability) {
      formData.append('availability', JSON.stringify(this.workforceForm.availability));
    }

    // ✅ Submit the FormData
    this.authService.signupWorkforce(formData).subscribe(response => {
      console.log('Workforce created:', response);

      const type = this.workforceForm.workForceType;
      if (type === WorkForceType.PROFESSIONAL_HELPER || type === WorkForceType.GENERAL_HELPER) {
        this.router.navigate(['/helper-dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}

}
