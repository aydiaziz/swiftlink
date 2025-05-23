import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://127.0.0.1:8000/api/services/';

  constructor(private http: HttpClient) {}

  getServiceTypes(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(this.apiUrl);
  }
}
