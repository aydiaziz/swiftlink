import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${this.apiUrl}/stats/`, 
      { headers: this.getHeaders() } // Ajout des headers ici
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/profile/`, 
      data,
      { headers: this.getHeaders() } // Headers également ici
    );
  }
}