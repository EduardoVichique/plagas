import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-tema-detail',
  templateUrl: './tema-detail.page.html',
  styleUrls: ['./tema-detail.page.scss'],
})
export class TemaDetailPage {
  tema: any = null;
  respuestas: any[] = [];
  nuevoRespuesta = '';
  loading = true;
  enviando = false;

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
    this.api.get<{ tema: any; respuestas: any[] }>(`/foro/temas/${id}`).subscribe({
      next: (res) => {
        this.tema = res.tema;
        this.respuestas = res.respuestas || [];
      },
      complete: () => (this.loading = false),
    });
  }

  enviarRespuesta(): void {
    if (!this.tema || !this.nuevoRespuesta.trim()) return;
    this.enviando = true;
    this.api.post<any>(`/foro/temas/${this.tema.id}/respuestas`, { contenido: this.nuevoRespuesta }).subscribe({
      next: (r) => {
        this.respuestas.push(r);
        this.nuevoRespuesta = '';
      },
      complete: () => (this.enviando = false),
    });
  }

  ayudaTema(): void {
    if (!this.tema) return;
    this.api.post<{ ayudas_count: number }>(`/foro/temas/${this.tema.id}/ayuda`, {}).subscribe({
      next: (res) => (this.tema.ayudas_count = res.ayudas_count),
    });
  }

  ayudaRespuesta(r: any): void {
    this.api.post<{ ayudas_count: number }>(`/foro/respuestas/${r.id}/ayuda`, {}).subscribe({
      next: (res) => (r.ayudas_count = res.ayudas_count),
    });
  }
}
