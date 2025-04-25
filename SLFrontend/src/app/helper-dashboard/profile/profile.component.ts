import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ProfileComponent {
  profileForm = this.fb.group({
    skills: [''],
    training: [''],
    hourlyRatebyService: [0, [Validators.min(0)]], 
    credentials: [''],
    driverLicence: ['']
  });

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService
  ) {}

  get hourlyRateControl() {
    return this.profileForm.get('hourlyRatebyService');
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.dashboardService.updateProfile(this.profileForm.value)
        .subscribe({
          next: () => alert('Profile updated successfully!'),
          error: (err) => console.error('Update error', err)
        });
    }
  }
}