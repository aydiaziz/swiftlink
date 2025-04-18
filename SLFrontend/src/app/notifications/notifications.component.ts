import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  showDropdown = false;  // ✅ Gérer l'affichage du menu

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  // ✅ Charger les notifications
  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => this.notifications = data,
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  // ✅ Toggle du dropdown
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
}
