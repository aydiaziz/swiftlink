import {
  Component, ElementRef, ViewChild, OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ChatService } from '../../services/chat.service';
import { CommunicationService } from '../../services/communication.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isClientLoggedIn = false;
  unreadCount = 0;
  notifications: any[] = [];
  showPopup = false;
  showMessagesPopup = false;
  conversations: any[] = [];
  currentUser: any;

  @ViewChild('notificationWrapper') notificationWrapper!: ElementRef;
  @ViewChild('messageWrapper') messageWrapper!: ElementRef;

  constructor(
    private communicationService: CommunicationService,
    private authService: AuthService,
    private router: Router,
    private notifService: NotificationService,
    private chatService: ChatService
  ) {
    this.authService.isClientLoggedIn$.subscribe(status => {
      this.isClientLoggedIn = status;
    });
  }

  ngOnInit() {
    this.loadUnreadCount();
    this.loadNotifications();
   this.authService.currentUser$.subscribe(user => {
    this.currentUser = user;
    });
    this.authService.getCurrentUser().subscribe();
  }

  loadUnreadCount() {
    this.notifService.getUnreadCount().subscribe(data => {
      this.unreadCount = data.count;
    });
  }

  loadNotifications() {
    this.notifService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  toggleNotificationPopup(event: MouseEvent) {
    event.stopPropagation();
    this.showPopup = !this.showPopup;
    this.showMessagesPopup = false;

    if (this.showPopup && this.unreadCount > 0) {
      this.notifService.markAsRead().subscribe(() => {
        this.unreadCount = 0;
      });
    }
  }

  toggleMessagesPopup(event: MouseEvent) {
    event.stopPropagation();
    this.showMessagesPopup = !this.showMessagesPopup;
    this.showPopup = false;

    if (this.showMessagesPopup) {
      this.chatService.getUserConversations().subscribe(data => {
        this.conversations = data;
      });
    }
  }

  handleGlobalClick(event: MouseEvent) {
    const notifEl = this.notificationWrapper?.nativeElement;
    const msgEl = this.messageWrapper?.nativeElement;

    if (notifEl && !notifEl.contains(event.target)) {
      this.showPopup = false;
    }

    if (msgEl && !msgEl.contains(event.target)) {
      this.showMessagesPopup = false;
    }
  }

  handleNotificationClick(notification: any) {
    const helperId = notification.related_helper;
    const orderId = notification.order;

    if (!helperId || !orderId) {
      console.error('Missing helper or order info in notification');
      return;
    }

    this.chatService.startConversation(helperId, orderId).subscribe(res => {
      const conversationId = res.conversation_id;
      this.communicationService.openChatPopup({ conversationId, helperId, orderId });
    });
  }

  openChat(conversationId: number, helperId: number, orderId: number) {
    this.showMessagesPopup = false;
    this.communicationService.openChatPopup({ conversationId, helperId, orderId });
  }

  getOtherUserName(conv: any): string {
    if (!this.currentUser || !conv.client || !conv.helper) return 'Unknown';
    return conv.client.id === this.currentUser.user_id
      ? conv.helper.first_name
      : conv.client.first_name;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
