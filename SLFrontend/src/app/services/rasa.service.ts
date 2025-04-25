import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RasaService {
  private rasaUrl = 'http://localhost:5005/webhooks/rest/webhook';

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
