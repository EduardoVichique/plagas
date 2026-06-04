import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((k) => {
        if (params[k] != null && params[k] !== '') {
          httpParams = httpParams.set(k, String(params[k]));
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.base}${path}`, { params: httpParams }).pipe(
      map(res => res.data)
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map(res => res.data)
    );
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, formData).pipe(
      map(res => res.data)
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map(res => res.data)
    );
  }

  putFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, formData).pipe(
      map(res => res.data)
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.base}${path}`).pipe(
      map(res => res.data)
    );
  }
}
