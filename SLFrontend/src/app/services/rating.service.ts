import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = `${environment.apiUrl}/ratings/`;
  constructor(private http: HttpClient) {}

  submitRating(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
