// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Client, Workforce } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isClientLoggedInSubject = new BehaviorSubject<boolean>(this.hasClientToken());
  isClientLoggedIn$ = this.isClientLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasClientToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  signupClient(clientData: Client): Observable<any> {
    const formattedData = {
      UserId: {
        email: clientData.email,
        username: clientData.email,
        last_name: clientData.lastName,
        first_name: clientData.firstName,
        password: clientData.password,
        entityId: 1 
      },
      clientType: clientData.clientType || 'Individual',
      address: clientData.address || '',
      city: clientData.city || '',
      province: clientData.province || '',
      postalCode: clientData.postalCode || '',
      phone: clientData.phone || ''
    };
  
    return this.http.post(`${this.apiUrl}/signup/client/`, formattedData).pipe(
      tap(() => this.isClientLoggedInSubject.next(true)),
      catchError(error => {
        console.error("Signup Client Error:", error);
        return throwError(() => new Error("Signup failed"));
      })
    );
  }
  private buildWorkforceFormData(data: Workforce): FormData {
  const formData = new FormData();

  // User JSON object
  const userObj = {
    email: data.email,
    username: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    password: data.password,
    entityId: 1
  };
  formData.append('UserId', JSON.stringify(userObj));

  // Flat fields
  formData.append('entityID', '1');
  formData.append('phone', data.phone || '');
  formData.append('gender', data.gender);
  formData.append('driverLicence', data.driverLicence || '');
  formData.append('training', data.training || '');
  formData.append('workForceType', data.workForceType);
  formData.append('address', data.address || '');
  formData.append('credentials', data.credentials || '');
  formData.append('skills', data.skills || '');
  formData.append('hourlyRatebyService', (data.hourlyRatebyService ?? '0').toString());

  if (data.resume) formData.append('resume', data.resume);
  if (data.yearsOfExperience) formData.append('yearsOfExperience', data.yearsOfExperience);
  if (data.socialSecurityNumber) formData.append('socialSecurityNumber', data.socialSecurityNumber);

  const parseDate = (d: string | undefined): string | null =>
    d ? new Date(d).toISOString().slice(0, 10) : null;

  const dob = parseDate(data.dateOfBirth);
  const credExp = parseDate(data.credentialsExpiry);
const licenceExp = data.driverLicence === 'Yes' && data.driverLicenceExpiry
  ? parseDate(data.driverLicenceExpiry)
  : null;
  
  if (dob) formData.append('dateOfBirth', dob);
  if (credExp) formData.append('credentialsExpiry', credExp);
  if (licenceExp) formData.append('driverLicenceExpiry', licenceExp);

  if (Array.isArray(data.workCategory)) {
    data.workCategory.forEach(cat => {
      formData.append('workCategory[]', cat.toString());
    });
  }

  if (data.availability) {
    formData.append('availability', JSON.stringify(data.availability));
  }

  return formData;
}

signupWorkforce1(workforceData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/signup/workforce/`, workforceData).pipe(
    catchError(error => {
      console.error("Signup Workforce Error:", error);
      return throwError(() => new Error("Signup failed"));
    })
  );
}
signupWorkforce(workforceData: Workforce): Observable<any> {
  const formData = this.buildWorkforceFormData(workforceData);

  return this.http.post(`${this.apiUrl}/signup/workforce/`, formData).pipe(
    catchError(error => {
      console.error("Signup Workforce Error:", error);
      return throwError(() => new Error("Signup failed"));
    })
  );
}




  signin(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin/`, credentials).pipe(
      tap((response: any) => {
        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('role', response.role);
          localStorage.setItem('user_id', response.user_id);
  
          if (response.role === 'Client') {
            this.isClientLoggedInSubject.next(true);
          }
        }
      }),
      catchError(error => {
        console.error("Signin Error:", error);
        return throwError(() => new Error("Invalid credentials"));
      })
    );
  }
  
  logout(): void {
    localStorage.clear();
    this.isClientLoggedInSubject.next(false);
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return throwError(() => new Error('No access token found'));
    }
  
    return this.http.get(`${this.apiUrl}/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  updateClientProfile(data: FormData) {
    return this.http.patch(`${this.apiUrl}/client/profile/`, data);
  }
}