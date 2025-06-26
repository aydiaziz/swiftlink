import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./home/navbar/navbar.component";
import { FooterComponent } from "./home/footer/footer.component";
import { CommunicationService } from './services/communication.service';
import { ChatComponent } from './chat/chat.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent,ChatComponent,NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  title = 'SLFrontend';
  chatPopups: { conversationId: number; helperId: number; orderId: number }[] = [];
  ngOnInit(): void {
    this.http.get(`${this.apiUrl}/csrf/`, { withCredentials: true }).subscribe();
  }
constructor(private commService: CommunicationService,private http: HttpClient) {
  this.commService.chatPopup$.subscribe(data => {
    const exists = this.chatPopups.find(p => p.conversationId === data.conversationId);
    if (!exists) {
      this.chatPopups.push(data);
    }
  });
}

closeChat(index: number) {
  this.chatPopups.splice(index, 1);
}
}

