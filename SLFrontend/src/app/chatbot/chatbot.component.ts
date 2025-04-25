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
  messages: { sender: 'user' | 'assistant', text: string, time: string }[] = [];
  clientId: string = '12345';  

  constructor(private rasaService: RasaService) {}

  sendMessage() {
    const message = this.userMessage.trim();
    if (!message) return;

    // Push user message
    this.messages.push({
      sender: 'user',
      text: message,
      time: this.getCurrentTime()
    });

    this.userMessage = '';

    // Send to Rasa with clientId
    this.rasaService.sendMessageToRasa(message, this.clientId).subscribe((responses) => {
      for (let res of responses) {
        this.messages.push({
          sender: 'assistant',
          text: res.text,
          time: this.getCurrentTime()
        });
      }
    });
  }

  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
