import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  experiencia?: string;
  tipo_cultivo?: string;
  avatar_url?: string;
  mfa_enabled?: boolean;
  rol?: string;
}

const TOKEN_KEY = 'plaga_token';
const USER_KEY = 'plaga_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) { }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private storeAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  registro(data: any): Observable<{ token: string; user: User }> {
    return this.http.post<ApiResponse<{ token: string; user: User }>>(`${this.api}/registro`, data).pipe(
      map(res => res.data),
      tap((res) => this.storeAuth(res.token, res.user))
    );
  }

  login(email: string, password: string): Observable<{ token?: string; user?: User; mfaRequired?: boolean; tempToken?: string }> {
    return this.http.post<ApiResponse<any>>(`${this.api}/login`, { email, password }).pipe(
      map(res => res.data),
      tap((res) => {
        if (!res.mfaRequired && res.token && res.user) {
          this.storeAuth(res.token, res.user);
        }
      })
    );
  }

  loginMfa(tempToken: string, token: string): Observable<{ token: string; user: User }> {
    return this.http.post<ApiResponse<any>>(`${this.api}/mfa/login`, { tempToken, token }).pipe(
      map(res => res.data),
      tap((res) => {
        if (res.token && res.user) {
          this.storeAuth(res.token, res.user);
        }
      })
    );
  }

  generateMfa(): Observable<{ qrCodeImage: string; secret: string }> {
    return this.http.post<ApiResponse<{ qrCodeImage: string; secret: string }>>(`${this.api}/mfa/generate`, {}).pipe(
      map(res => res.data)
    );
  }

  verifyMfa(token: string): Observable<{ mfa_enabled: boolean }> {
    return this.http.post<ApiResponse<{ mfa_enabled: boolean }>>(`${this.api}/mfa/verify`, { token }).pipe(
      map(res => res.data)
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  refreshMe(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.api}/me`).pipe(
      map(res => res.data),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }
}
