import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() sectionChanged = new EventEmitter<string>();
  currentSection: string = 'home';
  userRole: string | null = null;
  
  constructor(
    private auth: AuthService,
    public router: Router,
    public sidebar: SidebarService
  ) {}

  ngOnInit(): void {
    this.userRole = this.auth.getUserRole();
  }

  navigate(section: string): void {
    this.currentSection = section;
    this.sectionChanged.emit(section);
  }
  
  toggleSidebar(): void {
    this.sidebar.toggle();
  }
  navigateTo(section: string): void {
    this.currentSection = section;
    this.sectionChanged.emit(section);
    
    // Redirection vers la route correspondante
    if (section === 'profile') {
      this.router.navigate(['/profile']);
    } else if (section === 'home') {
      this.router.navigate(['/helper-dashboard']);
    } else if (section === 'agenda') {
      this.router.navigate(['/agenda']);
    }
  }
  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }
}