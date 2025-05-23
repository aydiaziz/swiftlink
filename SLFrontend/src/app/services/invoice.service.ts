import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://127.0.0.1:8000/api/invoices/';

  constructor(private http: HttpClient) {}

  // Initialiser la facture
  initInvoice(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}${orderId}/init/`);
  }

  // Soumettre la facture
  submitInvoice(orderId: string, data: any) {
    return this.http.post(`${this.apiUrl}${orderId}/submit/`, data, { responseType: 'blob' });
  }
}
