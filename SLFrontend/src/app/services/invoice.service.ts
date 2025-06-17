import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices/`;

  constructor(private http: HttpClient) {}

  // Initialiser la facture
  initInvoice(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${orderId}/init/`);
  }

  // Soumettre la facture
  submitInvoice(orderId: string, data: any) {
    return this.http.post(`${this.apiUrl}${orderId}/submit/`, data, { responseType: 'blob' });
  }

  getClientInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}client/`);
  }

  getHelperInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}helper/`);
  }

  updateInvoiceStatus(id: number, status: string) {
    return this.http.patch(`${this.apiUrl}${id}/status/`, { status });
  }

  getInvoice(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }
}
