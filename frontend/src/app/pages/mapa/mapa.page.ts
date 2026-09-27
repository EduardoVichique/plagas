import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

declare let L: any;

export interface ReporteMapa {
  id: number;
  titulo: string;
  descripcion?: string;
  latitud: number | string;
  longitud: number | string;
  estado?: string;
  tipo_plaga?: string;
  imagen_url?: string;
  created_at?: string;
  Usuario?: {
    nombre: string;
    apellido?: string;
  };
}

export type ModoVisualizacion = 'calor' | 'marcadores' | 'ambos';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  readonly MEXICO_CENTER: [number, number] = [23.6345, -102.5528];
  readonly DEFAULT_ZOOM = 5;

  map: any = null;
  heatLayer: any = null;
  heatCircles: any[] = [];
  markers: any[] = [];

  reportes: ReporteMapa[] = [];
  reportesFiltrados: ReporteMapa[] = [];
  loading = true;
  errorCarga = false;

  modoVista: ModoVisualizacion = 'ambos';
  tipoPlagaSeleccionada = 'TODAS';
  estadoSeleccionado = 'TODOS';

  tiposPlagaDisponibles: string[] = ['TODAS'];
  estadosDisponibles: string[] = ['TODOS', 'Pendiente', 'En revisión', 'Confirmado', 'Resuelto'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  ionViewDidEnter(): void {
    if (!this.map) {
      setTimeout(() => this.initMap(), 100);
    } else {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.limpiarCapas();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  cargarReportes(): void {
    this.loading = true;
    this.errorCarga = false;

    this.api.get<{ reportes: ReporteMapa[] }>('/reportes', { limit: 500 }).subscribe({
      next: (res) => {
        const rawReportes = res?.reportes || (Array.isArray(res) ? res : []);
        
        this.reportes = rawReportes.filter((r) => {
          if (r.latitud == null || r.longitud == null) return false;
          const lat = parseFloat(String(r.latitud));
          const lng = parseFloat(String(r.longitud));
          return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        });

        // Extraer tipos de plaga únicos para el filtro
        const plagasSet = new Set<string>();
        this.reportes.forEach((r) => {
          if (r.tipo_plaga) plagasSet.add(r.tipo_plaga);
        });
        this.tiposPlagaDisponibles = ['TODAS', ...Array.from(plagasSet)];

        this.aplicarFiltros();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorCarga = true;
      },
    });
  }

  initMap(): void {
    if (this.map || typeof L === 'undefined') return;
    const container = this.mapContainer?.nativeElement;
    if (!container) return;

    this.map = L.map(container, {
      center: this.MEXICO_CENTER,
      zoom: this.DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap | PlagaControl Epidemiológico',
      maxZoom: 18,
    }).addTo(this.map);

    this.map.on('zoomend', () => {
      if (this.modoVista === 'calor' || this.modoVista === 'ambos') {
        this.renderizarCapas();
      }
    });

    this.renderizarCapas();
  }

  aplicarFiltros(): void {
    this.reportesFiltrados = this.reportes.filter((r) => {
      const coincidePlaga =
        this.tipoPlagaSeleccionada === 'TODAS' ||
        (r.tipo_plaga && r.tipo_plaga.toLowerCase() === this.tipoPlagaSeleccionada.toLowerCase());
      
      const coincideEstado =
        this.estadoSeleccionado === 'TODOS' ||
        (r.estado && r.estado.toLowerCase() === this.estadoSeleccionado.toLowerCase());

      return coincidePlaga && coincideEstado;
    });

    this.renderizarCapas();
  }

  cambiarModoVista(modo: ModoVisualizacion): void {
    this.modoVista = modo;
    this.renderizarCapas();
  }

  resetearCentroMexico(): void {
    if (this.map) {
      this.map.setView(this.MEXICO_CENTER, this.DEFAULT_ZOOM);
    }
  }

  private limpiarCapas(): void {
    if (this.markers.length > 0) {
      this.markers.forEach((m) => m.remove());
      this.markers = [];
    }

    if (this.heatCircles.length > 0) {
      this.heatCircles.forEach((c) => c.remove());
      this.heatCircles = [];
    }

    if (this.heatLayer && this.map) {
      this.map.removeLayer(this.heatLayer);
      this.heatLayer = null;
    }
  }

  private renderizarCapas(): void {
    if (!this.map) return;

    this.limpiarCapas();

    const mostrarMarcadores = this.modoVista === 'marcadores' || this.modoVista === 'ambos';
    const mostrarCalor = this.modoVista === 'calor' || this.modoVista === 'ambos';

    // 1. Renderizar Capa de Calor Epidemiológico (Manchas de Calor en Píxeles + Gradientes)
    if (mostrarCalor) {
      // A) Capa de Gradiente Continuo (L.heatLayer) si el plugin está disponible
      if (typeof L.heatLayer === 'function') {
        const heatData = this.reportesFiltrados.map((r) => {
          const lat = parseFloat(String(r.latitud));
          const lng = parseFloat(String(r.longitud));
          let peso = 0.85;
          if (r.estado === 'Confirmado') peso = 1.0;
          else if (r.estado === 'Pendiente') peso = 0.85;
          else if (r.estado === 'En revisión') peso = 0.65;
          else if (r.estado === 'Resuelto') peso = 0.45;

          return [lat, lng, peso];
        });

        if (heatData.length > 0) {
          try {
            this.heatLayer = L.heatLayer(heatData, {
              radius: 65,
              blur: 35,
              minOpacity: 0.55,
              maxZoom: 10,
              max: 1.0,
              gradient: {
                0.15: '#ffee58',  // Amarillo brillante exterior
                0.40: '#ffca28',  // Amarillo-Naranja
                0.65: '#ff9800',  // Naranja medio
                0.85: '#f44336',  // Rojo intenso
                1.00: '#b71c1c'   // Rojo carmesí profundo (Foco)
              },
            }).addTo(this.map);
          } catch (e) {
            console.warn('L.heatLayer no pudo inicializarse:', e);
          }
        }
      }

      // B) MANCHAS DE CALOR RADIALES CON CIRCLEMARKER (EN PÍXELES)
      // Garantiza manchas circulares amarillas/naranjas/rojas enormes e imposibles de pasar por alto
      // idénticas a la imagen epidemiológica enviada por el usuario (SEREMI)
      const currentZoom = this.map.getZoom();
      // Ajuste dinámico de radios en píxeles según el nivel de zoom
      const baseOuterRadius = Math.max(35, Math.min(85, currentZoom * 11)); // Radio amarillo exterior (35px a 85px)
      const baseMidRadius = Math.round(baseOuterRadius * 0.6);             // Radio naranja medio
      const baseInnerRadius = Math.round(baseOuterRadius * 0.3);           // Radio rojo núcleo

      this.reportesFiltrados.forEach((r) => {
        const lat = parseFloat(String(r.latitud));
        const lng = parseFloat(String(r.longitud));

        // Anillo 1: Exterior - Halo Amarillo (Riesgo Bajo / Mancha Exterior)
        const outerCircle = L.circleMarker([lat, lng], {
          radius: baseOuterRadius,
          color: '#fbc02d',
          fillColor: '#ffee58',
          fillOpacity: 0.45,
          weight: 2,
          stroke: true,
          interactive: false,
        }).addTo(this.map);

        // Anillo 2: Medio - Zona Naranja (Riesgo Medio)
        const midCircle = L.circleMarker([lat, lng], {
          radius: baseMidRadius,
          color: '#f57c00',
          fillColor: '#ff9800',
          fillOpacity: 0.6,
          weight: 1,
          stroke: false,
          interactive: false,
        }).addTo(this.map);

        // Anillo 3: Núcleo - Foco Rojo (Riesgo Alto / Foco Epidemiológico)
        const innerCircle = L.circleMarker([lat, lng], {
          radius: baseInnerRadius,
          color: '#b71c1c',
          fillColor: '#d32f2f',
          fillOpacity: 0.8,
          weight: 1,
          stroke: false,
          interactive: false,
        }).addTo(this.map);

        // Recuadro de Texto tipo SEREMI con borde negro sobre la mancha
        const titleIcon = L.divIcon({
          className: 'heat-zone-label-icon',
          html: `<div class="heat-zone-box">${r.titulo}</div>`,
          iconSize: [140, 26],
          iconAnchor: [70, 13],
        });
        const labelMarker = L.marker([lat, lng], { icon: titleIcon, interactive: false }).addTo(this.map);

        this.heatCircles.push(outerCircle, midCircle, innerCircle, labelMarker);
      });
    }

    // 2. Renderizar Marcadores de Pin (si el modo lo requiere)
    if (mostrarMarcadores) {
      this.reportesFiltrados.forEach((r) => {
        const lat = parseFloat(String(r.latitud));
        const lng = parseFloat(String(r.longitud));

        const estadoBadge = r.estado
          ? `<span class="badge ${this.getBadgeClass(r.estado)}">${r.estado}</span>`
          : '';

        const popupContent = `
          <div class="map-popup-card">
            <h6 class="mb-1 font-weight-bold">${r.titulo}</h6>
            <div class="mb-1">${estadoBadge} ${r.tipo_plaga ? `<small class="text-success font-weight-bold">(${r.tipo_plaga})</small>` : ''}</div>
            ${r.descripcion ? `<p class="small text-muted mb-1">${r.descripcion}</p>` : ''}
            <small class="text-secondary d-block">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
          </div>
        `;

        const marker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup(popupContent);

        this.markers.push(marker);
      });
    }
  }

  private getBadgeClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'confirmado':
        return 'bg-danger text-white';
      case 'pendiente':
        return 'bg-warning text-dark';
      case 'en revisión':
        return 'bg-info text-dark';
      case 'resuelto':
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  }
}
