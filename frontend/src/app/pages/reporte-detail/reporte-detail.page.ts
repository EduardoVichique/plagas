import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reporte-detail',
  templateUrl: './reporte-detail.page.html',
  styleUrls: ['./reporte-detail.page.scss'],
})
export class ReporteDetailPage {
  reporte: any = null;
  nuevoComentario = '';
  loading = true;
  enviandoComentario = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ionViewDidEnter(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargar(Number(id));
  }

  cargar(id: number): void {
    this.loading = true;
    this.api.get<any>(`/reportes/${id}`).subscribe({
      next: (res) => (this.reporte = res),
      error: () => this.router.navigate(['/tabs/reportes']),
      complete: () => (this.loading = false),
    });
  }

  enviarComentario(): void {
    if (!this.reporte || !this.nuevoComentario.trim()) return;
    this.enviandoComentario = true;
    this.api.post<any>(`/reportes/${this.reporte.id}/comentarios`, { contenido: this.nuevoComentario }).subscribe({
      next: (com) => {
        if (!this.reporte.Comentarios) this.reporte.Comentarios = [];
        this.reporte.Comentarios.push(com);
        this.nuevoComentario = '';
      },
      error: () => {},
      complete: () => (this.enviandoComentario = false),
    });
  }
}
