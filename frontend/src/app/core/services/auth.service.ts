import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  experiencia?: string;
  tipo_cultivo?: string;
  avatar_url?: string;
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

  registro(data: { email: string; password: string; nombre: string; apellido?: string; experiencia?: string; tipo_cultivo?: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/registro`, data).pipe(
      tap((res) => {
        if (res.data?.token) {
          this.storeAuth(res.data.token, res.data.user);
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { email, password }).pipe(
      tap((res) => {
        if (res.data?.token) {
          this.storeAuth(res.data.token, res.data.user);
        }
      })
    );
  }

  verifyMfa(email: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.api}/verify-mfa`, { email, code }).pipe(
      tap((res) => {
        if (res.data?.token) {
          this.storeAuth(res.data.token, res.data.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSubject.next(null);
  }

  refreshMe(): Observable<User> {
    return this.http.get<any>(`${this.api}/me`).pipe(
      map((res) => res.data),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }
}
