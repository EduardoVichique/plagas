import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage {
  reportes: any[] = [];
  total = 0;
  loading = true;

  constructor(private api: ApiService, private router: Router) {}

  ionViewDidEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.api.get<{ total: number; reportes: any[] }>('/reportes').subscribe({
      next: (res) => {
        this.reportes = res.reportes || [];
        this.total = res.total || 0;
      },
      error: () => (this.reportes = []),
      complete: () => (this.loading = false),
    });
  }

  nuevo(): void {
    this.router.navigate(['/reporte-nuevo']);
  }

  ver(id: number): void {
    this.router.navigate(['/reporte', id]);
  }
}
