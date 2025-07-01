import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
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
export class NavbarComponent implements OnInit, OnDestroy {
  isClientLoggedIn = false;
  unreadCount = 0;
  messageUnreadCount = 0;
  notifications: any[] = [];
  showPopup = false;
  showMessagesPopup = false;
  conversations: any[] = [];
  currentUser: any;
  menuOpen = false;
  get profileLink(): string {
    const role = this.currentUser?.role || this.authService.getUserRole();
    if (role === '3rd Party') return '/helper-profile';
    if (role === 'Super Admin') return '/admin-profile';
    return '/client-profile';
  }
  private pollInterval: any;

  @ViewChild('notificationWrapper') notificationWrapper!: ElementRef;
  @ViewChild('messageWrapper') messageWrapper!: ElementRef;

  constructor(
    private communicationService: CommunicationService,
    private authService: AuthService,
    private router: Router,
    private notifService: NotificationService,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.authService.isClientLoggedIn$.subscribe(status => {
      this.isClientLoggedIn = status;
      if (status) {
        this.loadUnreadCount();
        this.loadUnreadMessages();
        this.loadNotifications();
        this.loadConversations();
        if (!this.pollInterval) {
          this.startPolling();
        }
        this.authService.getCurrentUser().subscribe();
      } else {
        this.clearPolling();
        this.unreadCount = 0;
        this.messageUnreadCount = 0;
        this.notifications = [];
        this.conversations = [];
        this.currentUser = null;
      }
    });
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.clearPolling();
  }

  loadUnreadCount() {
    this.notifService.getUnreadCount().subscribe(data => {
      this.unreadCount = data.count;
    });
  }

  loadUnreadMessages() {
    this.chatService.getUnreadCount().subscribe(data => {
      this.messageUnreadCount = data.count;
    });
  }

  loadNotifications() {
    this.notifService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  loadConversations() {
    this.chatService.getUserConversations().subscribe(data => {
      this.conversations = data;
    });
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      this.loadUnreadCount();
      this.loadUnreadMessages();
      this.loadNotifications();
      this.loadConversations();
    }, 5000);
  }

  clearPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
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
        this.loadUnreadMessages();
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
      this.router.navigate(['/helper-profile', helperId]);
    });
  }

  openChat(event: MouseEvent, conversationId: number, helperId: number, orderId: number) {
    event.stopPropagation();
    this.showMessagesPopup = false;
    this.communicationService.openChatPopup({ conversationId, helperId, orderId });
    this.loadUnreadMessages();
  }

  getOtherUserName(conv: any): string {
    if (!this.currentUser || !conv.client || !conv.helper) return 'Unknown';

    const clientId = conv.client.user_id ?? conv.client.id;
    const helperName = conv.helper.first_name || 'Unknown';
    const clientName = conv.client.first_name || 'Unknown';

    return clientId === this.currentUser.user_id ? helperName : clientName;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  redirectByRole() {
    const role = this.currentUser?.role || this.authService.getUserRole();
    if (role === '3rd Party') {
      this.router.navigate(['/helper-dashboard']);
    } else if (role === 'Super Admin') {
      this.router.navigate(['/office-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
