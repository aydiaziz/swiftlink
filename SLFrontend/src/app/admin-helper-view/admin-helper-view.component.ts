import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-helper-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-helper-view.component.html',
  styleUrls: ['./admin-helper-view.component.css']
})
export class AdminHelperViewComponent implements OnInit {
  helper: any;
  errorMessage = '';
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.adminService.getHelperById(+id).subscribe({
        next: (data) => {
          this.helper = data;
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Erreur lors du chargement du helper.';
          this.loading = false;
        }
      });
    }
    
  }
  
getAvailableTools(availability: any): string[] {
  if (!availability || typeof availability !== 'object') return [];
  return Object.keys(availability).filter(key => availability[key]);
}
  acceptHelper() {
    if (!this.helper) return;
    this.adminService.acceptHelper(this.helper.UserId).subscribe({
      next: () => {
        alert('Helper accepté et email envoyé.');
        this.router.navigate(['/admin/helpers']);
      },
      error: () => alert('Erreur lors de la validation du helper.')
    });
  }
}
