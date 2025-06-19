import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  startConversation(helperId: number,orderID: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/start/`, { helper_id: helperId,order_id: orderID });
  }

  getConversation(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}/`);
  }

  sendMessage(conversationId: number, content: string,senderId: number) {
    return this.http.post(`${this.baseUrl}/send/`, {
      conversation: conversationId,
      content,
      sender: senderId
    });
  }
  getUserConversations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/conversations/`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/unread_count/`);
  }
}