import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

declare let L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map: any;
  markers: any[] = [];
  reportes: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  ionViewDidEnter(): void {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  cargarReportes(): void {
    this.api.get<{ reportes: any[] }>('/reportes', { limit: '200' }).subscribe({
      next: (res) => {
        this.reportes = (res.reportes || []).filter((r) => r.latitud != null && r.longitud != null);
        this.loading = false;
        this.actualizarMarcadores();
      },
      error: () => (this.loading = false),
    });
  }

  initMap(): void {
    if (this.map || typeof L === 'undefined') return;
    const container = this.mapContainer?.nativeElement;
    if (!container) return;
    this.map = L.map(container).setView([40.4168, -3.7038], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    this.actualizarMarcadores();
  }

  actualizarMarcadores(): void {
    if (!this.map) return;
    this.markers.forEach((m) => m.remove());
    this.markers = [];
    this.reportes.forEach((r) => {
      const lat = parseFloat(r.latitud);
      const lng = parseFloat(r.longitud);
      if (isNaN(lat) || isNaN(lng)) return;
      const marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(`<strong>${r.titulo}</strong><br>${r.estado || ''}`);
      this.markers.push(marker);
    });
  }
}
