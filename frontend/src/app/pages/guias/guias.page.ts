import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-guias',
  templateUrl: './guias.page.html',
  styleUrls: ['./guias.page.scss'],
})
export class GuiasPage {
  guias: any[] = [];
  total = 0;
  loading = true;

  constructor(private api: ApiService, private router: Router) {}

  ionViewDidEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.api.get<{ total: number; guias: any[] }>('/guias').subscribe({
      next: (res) => {
        this.guias = res.guias || [];
        this.total = res.total || 0;
      },
      error: () => (this.guias = []),
      complete: () => (this.loading = false),
    });
  }

  ver(id: number): void {
    this.router.navigate(['/guia', id]);
  }
}
