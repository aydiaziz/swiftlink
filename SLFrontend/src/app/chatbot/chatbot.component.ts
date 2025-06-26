import { GptService } from '../services/gpt.service';
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
  conversationId?: number;

  constructor(private gptService: GptService) {}

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

    this.gptService.sendMessage(message, this.conversationId).subscribe({
      next: res => {
        if (res.conversation_id) {
          this.conversationId = res.conversation_id;
        }
        const reply = res.reply ?? '';
        if (reply) {
          this.messages.push({
            sender: 'assistant',
            text: reply,
            time: this.getCurrentTime()
          });
        }
        if (res.order_confirmed) {
          this.messages.push({
            sender: 'assistant',
            text: 'Your order has been created.',
            time: this.getCurrentTime()
          });
        }
      },
      error: err => {
        const detail = err?.error?.detail || 'Please log in to inquire about services.';
        this.messages.push({
          sender: 'assistant',
          text: detail,
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
