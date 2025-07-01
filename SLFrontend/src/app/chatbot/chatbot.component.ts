import { RasaService } from '../services/rasa.service'; 
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  userMessage = '';
  messages: { sender: 'user' | 'assistant', text: string, timestamp: string }[] = [];
  clientId: string = '12345';  

  constructor(private rasaService: RasaService) {}

  sendMessage() {
    const message = this.userMessage.trim();
    if (!message) return;

    // Push user message
    this.messages.push({
      sender: 'user',
      text: message,
      timestamp: this.getCurrentTimestamp()
    });

    this.userMessage = '';

    // Send to Rasa with clientId
    this.rasaService.sendMessageToRasa(message, this.clientId).subscribe((responses) => {
      for (let res of responses) {
        this.messages.push({
          sender: 'assistant',
          text: res.text,
          timestamp: this.getCurrentTimestamp()
        });
      }
    });
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: 'America/Denver',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    });
  }
}
