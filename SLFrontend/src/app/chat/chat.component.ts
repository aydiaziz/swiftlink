import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../services/chat.service';
import { CommunicationService } from '../services/communication.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  messageText = '';

  @Input() conversationId!: number;  // passed from <app-chat>
  @Input() helperId!: number;
  @Output() close = new EventEmitter<void>();
  currentUserId!: number;
  isClient:boolean=false;
  @Input() orderId!: number;
  orderConfirmed: boolean = false;
  defaultProfileImage: string = '/default-user.jpg';
  currentUser: any;
  

  constructor(private router: Router,private chatService: ChatService,private authService: AuthService,private orderService: OrderService) 
  {}

  ngOnInit() {
    if (this.conversationId) {
      this.chatService.getConversation(this.conversationId).subscribe(data => {
        this.messages = data.messages;
        
        
      });
    } else {
      console.error('❌ conversationId not provided to ChatComponent');
    }
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      this.currentUserId = user.user_id;
      this.isClient = user.role === 'Client'; 
    });
    
  }
  confirmOrder() {
    if (!this.conversationId) return;
    this.orderConfirmed = true;

  this.messages.push({
    content: "Your order has been confirmed",
    system: true // tu peux utiliser ce flag pour les messages spéciaux
  });
    this.orderService.confirmOrderAssignment(this.conversationId).subscribe({
      next: (res) => {
        if (res.success) {
          
          
        }
      },
      error: (err) => {
        console.error("❌ Error assigning order:", err);
       
      }
    });
  }
  send() {
    if (!this.messageText.trim()) return;
    
    
    this.chatService.sendMessage(this.conversationId, this.messageText,this.currentUserId).subscribe(() => {
      this.messages.push({
        content: this.messageText,
        sender: this.currentUserId,
        senderImage: this.currentUser?.profileImage || this.defaultProfileImage,
        timestamp: new Date()
      });
      this.messageText = '';
    });
  }
  goToHelperProfile(helperId: number) {
  this.router.navigate(['/helper-profile', helperId]);
}
  
}
