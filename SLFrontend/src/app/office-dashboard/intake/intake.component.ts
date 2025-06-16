import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-intake',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intake.component.html',
  styleUrl: './intake.component.css'
})
export class IntakeComponent implements OnInit{
  helpers: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadHelpers();
  }

  loadHelpers() {
    this.loading = true;
    this.adminService.getAllHelpers().subscribe({
      next: (data) => {
        this.helpers = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des helpers.';
        this.loading = false;
      }
    });
  }

  acceptHelper(helperId: number) {
    if (!confirm('Are you sure you want to accept this helper?')) return;

    this.adminService.acceptHelper(helperId).subscribe({
      next: () => {
        alert('Application accepted. Confirmation email delivered');
        this.loadHelpers(); // Refresh list
      },
      error: () => {
        alert("Erreur lors de l'acceptation du helper.");
      }
    });
  }
  requestInterview(helperId: number) {
    this.adminService.sendInterviewEmail(helperId).subscribe({
      next: () => {
        alert('Interview email sent successfully.');
        const helper = this.helpers.find(h => h.UserId === helperId);
      if (helper) helper.acces = 2;
        
      },
      error: err => {
        this.errorMessage = err.error?.error || 'Could not send interview email.';
      }
    });
  }
  activateHelper(userId: number) {
  this.adminService.activateHelper(userId).subscribe({
    next: () => {
      alert('Helper activated successfully.');
      const helper = this.helpers.find(h => h.UserId === userId);
      if (helper) helper.acces = 1; // Update UI status to Active
    },
    error: () => {
      this.errorMessage = 'Failed to activate helper.';
    }
  });
}
}
