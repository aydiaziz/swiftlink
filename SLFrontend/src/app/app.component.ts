import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./home/navbar/navbar.component";
import { FooterComponent } from "./home/footer/footer.component";
import { CommunicationService } from './services/communication.service';
import { ChatComponent } from './chat/chat.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent,ChatComponent,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showPopup = false;
  private apiUrl = environment.apiUrl;
  popupConversationId!: number;
  title = 'SLFrontend';
  popupData: { conversationId: number, helperId: number, orderId: number } | null = null;
  ngOnInit(): void {
    this.http.get(`${this.apiUrl}/csrf/`, { withCredentials: true }).subscribe();
  }
constructor(private commService: CommunicationService,private http: HttpClient) {
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

