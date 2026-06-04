import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-foro',
  templateUrl: './foro.page.html',
  styleUrls: ['./foro.page.scss'],
})
export class ForoPage {
  temas: any[] = [];
  total = 0;
  loading = true;
  creando = false;
  titulo = '';
  contenido = '';
  categoria = '';

  constructor(private api: ApiService, private router: Router) { }

  ionViewDidEnter(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.api.get<{ total: number; temas: any[] }>('/foro/temas').subscribe({
      next: (res) => {
        this.temas = res.temas || [];
        this.total = res.total || 0;
      },
      error: () => (this.temas = []),
      complete: () => (this.loading = false),
    });
  }

  crearTema(): void {
    if (!this.titulo.trim() || !this.contenido.trim()) return;
    this.creando = true;
    this.api.post('/foro/temas', { titulo: this.titulo, contenido: this.contenido, categoria: this.categoria || null }).subscribe({
      next: (tema) => {
        this.temas.unshift(tema);
        this.total++;
        this.titulo = '';
        this.contenido = '';
        this.categoria = '';
        this.creando = false;
      },
      error: () => (this.creando = false),
    });
  }

  ayuda(tema: any, event: Event): void {
    event.stopPropagation();
    this.api.post(`/foro/temas/${tema.id}/ayuda`, {}).subscribe({
      next: (res: any) => (tema.ayudas_count = res.ayudas_count),
    });
  }
}
