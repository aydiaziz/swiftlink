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
  isNoVehicleSelected = false;
  showPrivacyModal = false;
  services: ServiceType[] = [];
vehicleOptions = {
  vehicle: ['Car', 'Passenger Van / SUV', 'Pickup Truck', 'Cargo Van', 'No Vehicle',], 
  tools: ['Work Related Basic Tools','No Tools']
};
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

onVehicleSelect(event: Event, type: 'vehicle' | 'tool'): void {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (type === 'vehicle') {
    this.workforceForm.availability[value] = input.checked;

    if (value === 'No Vehicle') {
      this.isNoVehicleSelected = input.checked;

      if (input.checked) {
        // Uncheck other vehicles
        this.vehicleOptions.vehicle.forEach(opt => {
          if (opt !== 'No Vehicle') {
            this.workforceForm.availability[opt] = false;
          }
        });

      }
    } else {
      if (input.checked) {
        this.workforceForm.availability['No Vehicle'] = false;
        this.isNoVehicleSelected = false;
      }
    }

  } else if (type === 'tool') {
    // Allow only one tool to be selected at a time
    this.vehicleOptions.tools.forEach(tool => {
      this.workforceForm.availability[tool] = (tool === value) ? input.checked : false;
    });
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

  const formData = this.authService['buildWorkforceFormData'](this.workforceForm); // or extract this logic to a shared service

  this.authService.signupWorkforce(this.workforceForm).subscribe({
    next: () => {
      this.isLoading = false;
      this.router.navigate(['/confirmation']);
    },
    error: err => {
      this.isLoading = false;
      this.errorMessage = err?.error?.message || '❌ Registration error.';
    }
  });
}



showPrivacy(event: Event): void {
  const input = event.target as HTMLInputElement | null;
  if (input?.checked) {
    this.showPrivacyModal = true;
  }
}

}
