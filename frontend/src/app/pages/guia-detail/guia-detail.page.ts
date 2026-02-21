import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-guia-detail',
  templateUrl: './guia-detail.page.html',
  styleUrls: ['./guia-detail.page.scss'],
})
export class GuiaDetailPage {
  guia: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ionViewDidEnter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargar(Number(id));
  }

  cargar(id: number): void {
    this.loading = true;
    this.api.get<any>(`/guias/${id}`).subscribe({
      next: (res) => (this.guia = res),
      complete: () => (this.loading = false),
    });
  }
}
