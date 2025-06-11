import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { environment } from '../../environments/environment';
import { LogarithmicScale } from 'chart.js';
@Component({
  selector: 'app-helper-form',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './helper-form.component.html',
  styleUrl: './helper-form.component.css'
})
export class HelperFormComponent implements OnInit {
  errorMessage: string = '';
form: any = {
  country: 'Canada'  // valeur par défaut
};
  files: { [key: string]: File } = {};
emailError: string = '';
passwordError: string = '';
countries: string[] = ['Canada', 'United States', 'France', 'Germany', 'Australia', 'India', 'Tunisia', 'Other'];
constructor(private http: HttpClient, private router: Router,
  private route: ActivatedRoute,) {}

ngOnInit() {
  const helperId = this.route.snapshot.paramMap.get('id');
  if (helperId) {
    this.loadHelperData(helperId);
  }
}
loadHelperData(id: string): void {
  this.http.get(`${environment.apiUrl}/helpers/${id}/profile/`).subscribe({
    next: (data: any) => {
      this.form = data;

      console.log(data)
      if (data.professionnelemail) {
        this.router.navigate(['/onboardingcompleted']); 
      }
    },
    error: (err) => {
      console.error("Error loading helper profile:", err);
      this.errorMessage = "Unable to load your profile.";
    }
  });
}

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[field] = file;
    }
  }
  validateEmail(): void {
  if (this.form.professionnelemail && !this.form.professionnelemail.endsWith('@swift-helpers.com')) {
    this.emailError = 'Email must end with @swift-helpers.com';
  } else {
    this.emailError = '';
  }
}
calculateRates() {
  if (this.form.hourlyRatebyService) {
    const base = this.form.hourlyRatebyService;
    this.form.securityFundRate = +(base * 0.10).toFixed(2);
    this.form.platformFeeRate = +(base * 0.10).toFixed(2);
    this.form.clientChargeRate = +(base * 1.20).toFixed(2); // 100% + 15% + 5%
  } else {
    this.form.securityFundRate = 0;
    this.form.platformFeeRate = 0;
    this.form.clientChargeRate = 0;
  }
}
 submit() {
   const helperId = this.route.snapshot.paramMap.get('id');
  if (this.form.password !== this.form.confirmPassword) {
    this.passwordError = "Passwords do not match";
    return;
  } else {
    this.passwordError = '';
  }

  if (this.emailError) {
    return;
  }

  const formData = new FormData();
  for (const key in this.form) {
    if (this.form[key] !== undefined && this.form[key] !== null) {
      formData.append(key, this.form[key]);
    }
  }
  for (const fileKey in this.files) {
    formData.append(fileKey, this.files[fileKey]);
  }

  this.http.patch(`${environment.apiUrl}/helper/profile-completion/${helperId}/`, formData).subscribe({
    next: () => {
      alert("✅ Your profile has been completed successfully!");
      this.router.navigate(['/confirmationOnboarding']);
    },
    error: err => {
      alert("❌ Error submitting profile.");
      console.error(err);
    }
  });
}
onFileSelect(event: Event, field: 'profileImage' | 'driverLicenceFile' | 'wcbFile'): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.form[field] = file;
  }
}
}
