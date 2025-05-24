import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RasaService {
  private rasaUrl = environment.chatUrl;

  constructor(private http: HttpClient) {}

  sendMessageToRasa(message: string, clientId: string): Observable<any> {
    const body = {
      message: message,
      sender: 'user',  // You can use a unique identifier for the user, like a session ID
      metadata: { client_id: clientId }
    };

    return this.http.post<any>(this.rasaUrl, body);
  }
}
