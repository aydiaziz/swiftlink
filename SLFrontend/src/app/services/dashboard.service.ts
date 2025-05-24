import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/dashboard/helper/`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/profile/`, 
      data,
      { headers: this.getHeaders() } // Headers également ici
    );
  }
  getHelperProfile(userId: number) {
  return this.http.get(`${environment.apiUrl}/helpers/${userId}/profile/`);
}
}