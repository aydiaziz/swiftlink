import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://127.0.0.1:8000/api/orders/';

  constructor(private http: HttpClient) {}
  getAllOrders(): Observable<any> {
    const token = localStorage.getItem('access_token');  // 🔥 Récupère le token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(this.apiUrl, { headers });
  }

  // ✅ Récupérer les ordres liés au `serviceType`
  getOrdersByServiceType(serviceType: string): Observable<any[]> {
    const token = localStorage.getItem('access_token'); // 🔥 Vérifie si l'utilisateur est authentifié
    if (!token) {
      console.error('No access token found!');
      return new Observable();
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}my-service/?serviceType=${serviceType}`, { headers });
  }

  // ✅ Liker un ordre
  likeOrder(orderID: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No access token found!');
      return new Observable();
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.apiUrl}${orderID}/like/`, {}, { headers });
  }
}
