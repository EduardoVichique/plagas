import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { PredictResponse, MetricsResponse, PredictionHistoryItem } from '../../shared/interfaces/scanner.interface';

@Injectable({ providedIn: 'root' })
export class ScannerService {
  private base = environment.mlApiUrl;

  constructor(private http: HttpClient) {}

  predict(imageFile: File): Observable<PredictResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<ApiResponse<PredictResponse>>(`${this.base}/predict`, formData).pipe(
      map(res => res.data)
    );
  }

  getMetrics(): Observable<MetricsResponse> {
    return this.http.get<ApiResponse<MetricsResponse>>(`${this.base}/metrics`).pipe(
      map(res => res.data)
    );
  }

  getPredictions(): Observable<PredictionHistoryItem[]> {
    return this.http.get<ApiResponse<PredictionHistoryItem[]>>(`${this.base}/predictions`).pipe(
      map(res => res.data)
    );
  }
}
