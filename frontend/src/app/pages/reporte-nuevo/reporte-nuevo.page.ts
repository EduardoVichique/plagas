import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reporte-nuevo',
  templateUrl: './reporte-nuevo.page.html',
  styleUrls: ['./reporte-nuevo.page.scss'],
})
export class ReporteNuevoPage {
  titulo = '';
  descripcion = '';
  tipo_plaga = '';
  latitud: number | null = null;
  longitud: number | null = null;
  imagenFile: File | null = null;
  imagenPreview: string | null = null;
  loading = false;
  error = '';
  gpsLoading = false;

  constructor(private api: ApiService, private router: Router) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.imagenFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagenPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  obtenerUbicacion(): void {
    this.gpsLoading = true;
    this.error = '';
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.latitud = pos.coords.latitude;
          this.longitud = pos.coords.longitude;
          this.gpsLoading = false;
        },
        () => {
          this.error = 'No se pudo obtener la ubicación';
          this.gpsLoading = false;
        }
      );
    } else {
      this.error = 'Geolocalización no disponible';
      this.gpsLoading = false;
    }
  }

  enviar(): void {
    this.error = '';
    if (!this.titulo.trim()) {
      this.error = 'El título es obligatorio';
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('tipo_plaga', this.tipo_plaga);
    if (this.latitud != null) formData.append('latitud', String(this.latitud));
    if (this.longitud != null) formData.append('longitud', String(this.longitud));
    if (this.imagenFile) formData.append('imagen', this.imagenFile);
    this.api.postFormData<any>('/reportes', formData).subscribe({
      next: (reporte) => this.router.navigate(['/reporte', reporte.id]),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al crear el reporte';
      },
      complete: () => (this.loading = false),
    });
  }
}
