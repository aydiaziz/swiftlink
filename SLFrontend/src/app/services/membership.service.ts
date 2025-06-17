import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Membership {
  membershipID: number;
  membershipType: string;
  cost: string;
  promotionCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private apiUrl = `${environment.apiUrl}/memberships/`;

  constructor(private http: HttpClient) {}

  getMemberships(): Observable<Membership[]> {
    return this.http.get<Membership[]>(this.apiUrl);
  }
}
