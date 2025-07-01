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

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      return Date.now() < payload.exp * 1000;
    } catch (e) {
      return false;
    }
  }

  private hasClientToken(): boolean {
    const token = localStorage.getItem('access_token');
    return token ? this.isTokenValid(token) : false;
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
      phone: clientData.phone || '',
      membershipType: clientData.membershipType
    };
  
    return this.http.post(`${this.apiUrl}/signup/client/`, formattedData).pipe(
      tap(() => this.isClientLoggedInSubject.next(true)),
      catchError(error => {
        console.error('Signup Client Error:', error);
        return throwError(() => error);
      })
    );
  }

  signupWorkforce(workforceData: Workforce | FormData): Observable<any> {
  if (workforceData instanceof FormData) {
    return this.http.post(`${this.apiUrl}/signup/workforce/`, workforceData).pipe(
      catchError(error => {
        console.error('Signup Workforce Error:', error);
        return throwError(() => error);
      })
    );
  }

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

  if (workforceData.resume) {
    const form = new FormData();
    Object.entries(formattedData.UserId).forEach(([k, v]) => {
      form.append(`UserId.${k}`, v as any);
    });
    delete formattedData.UserId;
    for (const key in formattedData) {
      const value = (formattedData as any)[key];
      if (value === undefined || value === null) {
        continue;
      }
      if (key === 'workCategory' && Array.isArray(value)) {
        value.forEach((val: any) => form.append('workCategory', val));
      } else if (typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, value);
      }
    }
    form.append('resume', workforceData.resume);
    return this.http.post(`${this.apiUrl}/signup/workforce/`, form).pipe(
      catchError(error => {
        console.error('Signup Workforce Error:', error);
        return throwError(() => error);
      })
    );
  }

  return this.http.post(`${this.apiUrl}/signup/workforce/`, formattedData).pipe(
    catchError(error => {
      console.error('Signup Workforce Error:', error);
      return throwError(() => error);
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

        // Marquer comme connecté
        this.isClientLoggedInSubject.next(true);
      }
    }),
    // Recharger les infos utilisateur après connexion
    tap(() => {
      this.getCurrentUser().subscribe();
    }),
    // Gérer les erreurs proprement
    catchError(error => {
      console.error("Signin Error:", error);
      return throwError(() => new Error("Invalid credentials"));
    })
  );
}

  
  logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('role');
  localStorage.removeItem('user_id');

  this.currentUserSubject.next(null); // ❗ vider l'utilisateur
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
    return this.http.post(`${this.apiUrl}/login-superadmin/`, data).pipe(
      tap((response: any) => {
        if (response.access && response.refresh) {
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('role', response.role);
          localStorage.setItem('user_id', response.user_id);
          this.isClientLoggedInSubject.next(true);
        }
      }),
      tap(() => {
        this.getCurrentUser().subscribe();
      }),
      catchError(error => {
        console.error('SuperAdmin Login Error:', error);
        return throwError(() => new Error('Invalid credentials'));
      })
    );
  }
updateUserProfile(data:FormData){
  return this.http.patch(`${this.apiUrl}/updateuser/`, data)
}
}