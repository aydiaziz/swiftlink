import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Client, Workforce } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private isClientLoggedInSubject = new BehaviorSubject<boolean>(this.hasClientToken());
  isClientLoggedIn$ = this.isClientLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ✅ Vérifie si un token est déjà présent
  private hasClientToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // ✅ Inscription Client
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
        console.error("❌ Signup Client Error:", error);
        return throwError(() => new Error("Signup failed"));
      })
    );
  }
  

  // ✅ Inscription Workforce
  signupWorkforce(workforceData: Workforce): Observable<any> {
    const formattedData = {
      UserId: {
        email: workforceData.email,
        username: workforceData.email,  // ✅ Username = Email
        first_name: workforceData.firstName,
        last_name: workforceData.lastName,
        password: workforceData.password,
        entityId: 1
      },
      phone: workforceData.phone || '',
      gender: workforceData.gender,
      driverLicence: workforceData.driverLicence || '',
      driverLicenceExpiry: workforceData.driverLicenceExpiry || '',
      credentials: workforceData.credentials || '',
      credentialsExpiry: workforceData.credentialsExpiry || '',
      training: workforceData.training || '',
      workForceType: workforceData.workForceType,
      dateOfBirth: workforceData.dateOfBirth,
      socialSecurityNumber: workforceData.socialSecurityNumber || '',
      skills: workforceData.skills || '',
      address: workforceData.address || '',
      workCategory: workforceData.workCategory || [],
      availability: workforceData.availability || {},
      hourlyRatebyService: workforceData.hourlyRatebyService || 0
    };

    console.log("🚀 Signup Workforce Data:", formattedData); // 🔥 Debugging

    return this.http.post(`${this.apiUrl}/signup/workforce/`, formattedData).pipe(
      catchError(error => {
        console.error("❌ Signup Workforce Error:", error);
        return throwError(() => new Error("Signup failed"));
      })
    );
  }

  // ✅ Connexion (Signin)
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
        console.error("❌ Signin Error:", error);
        return throwError(() => new Error("Invalid credentials"));
      })
    );
  }
  
  // ✅ Déconnexion
  logout() {
    localStorage.clear();
    this.isClientLoggedInSubject.next(false);
  }

  // ✅ Récupérer le rôle de l'utilisateur
  getUserRole(): string | null {
    return localStorage.getItem('role');
  }
  // ✅ Récupérer l'utilisateur connecté
  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('access_token'); // 🔥 Récupère le token
    if (!token) {
      return throwError(() => new Error('No access token found'));
    }
  
    return this.http.get(`${this.apiUrl}/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  

}
