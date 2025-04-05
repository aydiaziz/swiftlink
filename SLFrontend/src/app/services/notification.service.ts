import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://127.0.0.1:8000/api/notifications/';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any> {
    const token = localStorage.getItem('access_token');  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(this.apiUrl, { headers });
  }
}
