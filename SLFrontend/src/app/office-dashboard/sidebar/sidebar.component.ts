import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
 userRole: string | null = null;
    constructor(
      private auth: AuthService,
      public router: Router,
      
    ) {}
      ngOnInit(): void {
    this.userRole = this.auth.getUserRole();
  }
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

}
