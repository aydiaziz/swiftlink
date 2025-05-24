import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  getAllHelpers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/admin/helpers`);
}

acceptHelper(helperId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/admin/helpers/${helperId}/accept`, {});
}
getHelperById(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/admin/helper/${id}`);
}
}
