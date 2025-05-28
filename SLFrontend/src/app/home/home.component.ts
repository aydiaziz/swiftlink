import { Component } from '@angular/core';
import { ServicesComponent } from "./services/services.component";
import { AboutComponent } from "./about/about.component";
import { ContactComponent } from "./contact/contact.component";
import { FormsModule } from '@angular/forms';
import { HeroComponent } from "./hero/hero.component";
import { FeaturesComponent } from "./features/features.component";
import { TabsComponent } from "./tabs/tabs.component";
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { ChatComponent } from '../chat/chat.component';
import { CommunicationService } from '../services/communication.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ChatbotComponent, FeaturesComponent, TabsComponent,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  helpMessage: string = '';
  showChat = false;
  selectedConversationId: number=0;
  constructor( private communicationService: CommunicationService,private router: Router, private http: HttpClient) {}
  sendMessage() {
    if (this.helpMessage.trim()) {
      
      alert(`Message sent: ${this.helpMessage}`);
      this.helpMessage = ''; // Réinitialiser le champ après envoi
    }
  }
  ngOnInit(): void {
    this.communicationService.helperId$.subscribe(helperId => {
      if (helperId) {
        this.startConversation(helperId);
      }
    });
  }
  startConversation(helperId: number) {
    this.http.post(`${environment.apiUrl}/start-conversation/`, { helper_id: helperId }).subscribe({
      next: (res: any) => {
        this.selectedConversationId = res.conversation_id;
        this.showChat = true;
      },
      error: (err) => {
        console.error('Error starting conversation:', err);
      }
    });
  }
  onNotificationClick(helperId: number) {
    this.http.post(`${environment.apiUrl}/start-conversation/`, { helper_id: helperId }).subscribe((res: any) => {
      this.selectedConversationId = res.conversation_id;
      this.showChat = true;
    });
  }
}
