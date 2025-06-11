// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
 private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
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

  signupWorkforce(workforceData: Workforce): Observable<any> {
  const formattedData: any = {
    entityID: 1,
    UserId: {
      email: workforceData.email,
      username: workforceData.email,
      first_name: workforceData.firstName,
      last_name: workforceData.lastName,
      password: workforceData.password,
      entityId: 1
    },
    phone: workforceData.phone || '',
    gender: workforceData.gender,
    driverLicence: workforceData.driverLicence || '',
    training: workforceData.training || '',
    workForceType: workforceData.workForceType,
    address: workforceData.address || '',
    workCategory: workforceData.workCategory || [],
    availability: workforceData.availability,
    credentials: workforceData.credentials,
    credentialsExpiry: workforceData.credentialsExpiry,
    dateOfBirth: workforceData.dateOfBirth,
    socialSecurityNumber: workforceData.socialSecurityNumber,
    skills: workforceData.skills,
    hourlyRatebyService: workforceData.hourlyRatebyService,
    resume:workforceData.resume || null,
    yearsOfExperience:workforceData.yearsOfExperience,
    driverLicenceClass:workforceData.driverLicenceClass
  };

  // ✅ Ajouter driverLicenceExpiry uniquement si permis = "Yes"
  if (workforceData.driverLicence === 'Yes' && workforceData.driverLicenceExpiry) {
    const rawDate = new Date(workforceData.driverLicenceExpiry);
    formattedData.driverLicenceExpiry = rawDate.toISOString().slice(0, 10);
  }

  return this.http.post(`${this.apiUrl}/signup/workforce/`, formattedData).pipe(
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
  
          
            this.isClientLoggedInSubject.next(true);
          
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

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/me/`, { headers }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }
  updateClientProfile(data: FormData) {
    return this.http.patch(`${this.apiUrl}/client/profile/`, data);
  }
  loginSuperAdmin(data: { email: string; password: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/login-superadmin/`, data);
}
updateUserProfile(data:FormData){
  return this.http.patch(`${this.apiUrl}/updateuser/`, data)
}
}