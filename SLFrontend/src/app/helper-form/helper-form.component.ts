import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { environment } from '../../environments/environment.prod';
@Component({
  selector: 'app-helper-form',
  standalone: true,
  imports: [FormsModule,NgIf],
  templateUrl: './helper-form.component.html',
  styleUrl: './helper-form.component.css'
})
export class HelperFormComponent  {
  errorMessage: string = '';
 form: any = {};
  files: { [key: string]: File } = {};

  constructor(private http: HttpClient, private router: Router) {}

  onFileChange(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      this.files[field] = file;
    }
  }
calculateRates() {
  if (this.form.hourlyRatebyService) {
    const base = this.form.hourlyRatebyService;
    this.form.securityFundRate = +(base * 0.15).toFixed(2);
    this.form.platformFeeRate = +(base * 0.05).toFixed(2);
    this.form.clientChargeRate = +(base * 1.20).toFixed(2); // 100% + 15% + 5%
  } else {
    this.form.securityFundRate = 0;
    this.form.platformFeeRate = 0;
    this.form.clientChargeRate = 0;
  }
}
  submit() {
    const formData = new FormData();
    for (const key in this.form) {
      if (this.form[key] !== undefined && this.form[key] !== null) {
        formData.append(key, this.form[key]);
      }
    }
    for (const fileKey in this.files) {
      formData.append(fileKey, this.files[fileKey]);
    }

    this.http.post(`${environment.apiUrl}/helper/profile-completion/`, formData).subscribe({
      next: () => {
        alert("✅ Your profile has been completed successfully!");
        this.router.navigate(['/helper-dashboard']);
      },
      error: err => {
        alert("❌ Error submitting profile.");
        console.error(err);
      }
    });
  }
  onFileSelect(event: Event, field: 'driverLicenceFile' | 'wcbFile'): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.form[field] = file;
  }
}
}
