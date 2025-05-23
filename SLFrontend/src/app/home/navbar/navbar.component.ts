import { Component,importProvidersFrom,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { ChatService } from '../../services/chat.service';
import { CommunicationService } from '../../services/communication.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isClientLoggedIn = false;
  unreadCount = 0;
  notifications: any[] = [];
  showPopup = false;
  notification:number=0;
  showMessagesPopup = false;
  conversations: any[] = [];
  currentUser: any;
  constructor(private communicationService: CommunicationService,private authService: AuthService, private router: Router,private notifService: NotificationService,private chatService: ChatService) {
    this.authService.isClientLoggedIn$.subscribe(status => {
      this.isClientLoggedIn = status;
    });
  }
  ngOnInit() {
    this.loadUnreadCount();
    this.loadNotifications();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }
  loadUnreadCount() {
    this.notifService.getUnreadCount().subscribe(data => {
      this.unreadCount = data.count;
    });
  }
  onNotificationClick(helperId: number) {
    this.communicationService.openChatWith(helperId);
  }
  loadNotifications() {
    this.notifService.getNotifications().subscribe(data => {
      this.notifications = data;
      console.log('Notifications:', this.notifications);
    });
    
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
  
      this.communicationService.openChatPopup({
        conversationId,
        helperId,
        orderId
      });
    });
  }

  toggleNotificationPopup() {
    this.showPopup = !this.showPopup;
    if (this.showPopup && this.unreadCount > 0) {
      this.notifService.markAsRead().subscribe(() => {
        this.unreadCount = 0;
      });
    }}
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/signin']);}
    toggleMessagesPopup() {
      this.showMessagesPopup = !this.showMessagesPopup;
      if (this.showMessagesPopup) {
        this.chatService.getUserConversations().subscribe(data => {
          this.conversations = data;
        });
      }
    }
    openChat(conversationId: number, helperId: number, orderId: number) {
      this.showMessagesPopup = false;
      this.communicationService.openChatPopup({
        conversationId,
        helperId,
        orderId
      });
    }
    getOtherUserName(conv: any): string {
      console.log('🔍 Current user:', this.currentUser);
      console.log('🔍 Conversation object:', conv);
    
      if (!this.currentUser || !conv.client || !conv.helper) {
        return 'Unknown';
      }
    
      const name =
        conv.client.id === this.currentUser.user_id
          ? conv.helper.first_name
          : conv.client.first_name;
    
      console.log('✅ Other user firstname:', name);
      return name;
    }
    
}
