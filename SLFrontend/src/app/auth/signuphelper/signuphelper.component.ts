import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ServicetypeService, ServiceType } from '../../services/servicetype.service';
import { Gender, Workforce, WorkForceType } from '../../models/user.model';

@Component({
  selector: 'app-signuphelper',
  standalone: true,
  imports: [FormsModule,NgIf, RouterModule, NgFor],
  templateUrl: './signuphelper.component.html',
  styleUrls: ['./signuphelper.component.css']
})
export class SignuphelperComponent implements OnInit {
  errorMessage = '';
  services: ServiceType[] = [];
  vehicleOptions: string[] = [
    'Car',
    'Passenger Van / SUV',
    'Pickup Truck',
    'Cargo Van',
    'No Vehicle',
    'Work Related Basic Tools',
    'No Tools'
  ];
 isLoading: boolean = false;
  workForceTypes = Object.values(WorkForceType);
  genders = Object.values(Gender);

  workforceForm: any = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: 'temp1234',
    phone: '',
    city: '',
    gender: Gender.MALE,
    driverLicence: '',
    driverLicenceClass: '',
    driverLicenceExpiry: '',
    credentials: '',
    credentialsExpiry: '',
    training: '',
    yearsOfExperience: '',
    resume: null,
    workForceType: WorkForceType.EMPLOYEE,
    dateOfBirth: '',
    socialSecurityNumber: '',
    skills: '',
    address: '',
    workCategory: [],
    availability: {},
    hourlyRatebyService: 0
  };

  acceptedPolicy: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private serviceTypeService: ServicetypeService
  ) {}

  ngOnInit(): void {
    this.loadServiceTypes();
  }

  loadServiceTypes(): void {
    this.serviceTypeService.getServiceTypes().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (err) => {
        console.error('❌ Failed to load service types', err);
      }
    });
  }

  onServiceSelect(event: any): void {
    const id = +event.target.value;
    if (event.target.checked) {
      this.workforceForm.workCategory.push(id);
    } else {
  this.workforceForm.workCategory = this.workforceForm.workCategory.filter((s: number) => s !== id);
    }
  }

  onVehicleSelect(event: any): void {
    const value = event.target.value;
    this.workforceForm.availability = this.workforceForm.availability || {};
    if (event.target.checked) {
      this.workforceForm.availability[value] = true;
    } else {
      delete this.workforceForm.availability[value];
    }
  }

  onFileChange(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      this.workforceForm[field] = file;
    }
  }

 register(): void {
  if (!this.acceptedPolicy || !this.workforceForm.firstName || !this.workforceForm.training) {
    this.errorMessage = 'Please complete all required fields and accept the Privacy Policy.';
    return;
  }
   this.isLoading = true;
  const payload = { ...this.workforceForm };
  payload.username = payload.email;
  const dateFields = ['dateOfBirth', 'credentialsExpiry', 'driverLicenceExpiry'];
  dateFields.forEach(field => {
    const value = payload[field];

    if (value && typeof value === 'string' && value.trim() !== '') {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        payload[field] = parsedDate.toISOString().slice(0, 10);
      } else {
        delete payload[field];
      }
    } else {
      delete payload[field];
    }
  });

  this.authService.signupWorkforce(payload).subscribe({
    next: () => {
      this.isLoading = false;
      this.router.navigate(['/confirmation']);
    },
    error: err => {
      this.errorMessage = err?.error?.message || '❌ Registration error.';
    }
  });
}


}
