import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GptService {
  private chatUrl = environment.chatUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, conversationId?: number): Observable<any> {
    const body: any = { message };
    if (conversationId) {
      body.conversation_id = conversationId;
    }
    return this.http.post<any>(this.chatUrl, body);
  }
}
