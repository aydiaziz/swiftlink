import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
console.log("API URL:", environment.apiUrl);
export interface ServiceType {
  serviceTypeID: number;
  serviceName: string;
  serviceDescription: string;
  division: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServicetypeService {
  private apiUrl = `${environment.apiUrl}/services/`;

  constructor(private http: HttpClient) {}

  getServiceTypes(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(this.apiUrl);
  }
}
