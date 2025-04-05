import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isClientLoggedIn = false;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.isClientLoggedIn$.subscribe(status => {
      this.isClientLoggedIn = status;
    });
  }
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/signin']);}
}
