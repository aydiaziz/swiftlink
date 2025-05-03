import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./home/navbar/navbar.component";
import { FooterComponent } from "./home/footer/footer.component";
import { CommunicationService } from './services/communication.service';
import { ChatComponent } from './chat/chat.component';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent,ChatComponent,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  showPopup = false;
  popupConversationId!: number;
  title = 'SLFrontend';
  popupData: { conversationId: number, helperId: number, orderId: number } | null = null;

constructor(private commService: CommunicationService) {
  this.commService.chatPopup$.subscribe(data => {
    this.popupData = data;
    this.showPopup = true;
  });
}

closeChat() {
  this.showPopup = false;
  this.popupData = null;
}
}

