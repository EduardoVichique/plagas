import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';
import { ScannerService } from '../../core/services/scanner.service';
import { PredictResponse, MetricsResponse, PredictionHistoryItem } from '../../shared/interfaces/scanner.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  segment = 'escanear';
  
  // Variables de escaneo
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  predictionResult: PredictResponse | null = null;
  
  // Historial y Métricas
  historyList: PredictionHistoryItem[] = [];
  metrics: MetricsResponse | null = null;
  
  // Estados de carga
  loadingPredict = false;
  loadingHistory = false;
  loadingMetrics = false;

  constructor(
    private scannerService: ScannerService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Carga inicial pasiva
    this.cargarMetricas();
  }

  ionViewWillEnter() {
    if (this.segment === 'historial') {
      this.cargarHistorial();
    }
  }

  segmentChanged(event: any) {
    const val = event.detail.value;
    if (val === 'historial') {
      this.cargarHistorial();
    } else if (val === 'metricas') {
      this.cargarMetricas();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.presentToast('Por favor, selecciona un archivo de imagen válido.', 'danger');
        return;
      }
      this.selectedFile = file;
      this.predictionResult = null; // Limpiar resultado previo
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async analizarImagen() {
    if (!this.selectedFile) {
      this.presentToast('Por favor, selecciona o captura una imagen primero.', 'warning');
      return;
    }

    this.loadingPredict = true;
    const loading = await this.loadingController.create({
      message: 'Analizando imagen con Inteligencia Artificial...',
      spinner: 'crescent'
    });
    await loading.present();

    this.scannerService.predict(this.selectedFile).subscribe({
      next: (res) => {
        this.predictionResult = res;
        this.presentToast('Detección completada exitosamente.', 'success');
        this.loadingPredict = false;
        loading.dismiss();
      },
      error: (err) => {
        console.error(err);
        const errMsg = err.error?.message || 'Error al conectar con el servidor de análisis.';
        this.presentToast(errMsg, 'danger');
        this.loadingPredict = false;
        loading.dismiss();
      }
    });
  }

  cargarHistorial() {
    this.loadingHistory = true;
    this.scannerService.getPredictions().subscribe({
      next: (res) => {
        this.historyList = res;
        this.loadingHistory = false;
      },
      error: (err) => {
        console.error(err);
        this.presentToast('Error al cargar el historial de predicciones.', 'danger');
        this.loadingHistory = false;
      }
    });
  }

  cargarMetricas() {
    this.loadingMetrics = true;
    this.scannerService.getMetrics().subscribe({
      next: (res) => {
        this.metrics = res;
        this.loadingMetrics = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMetrics = false;
      }
    });
  }

  limpiarEscaner() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.predictionResult = null;
  }

  resolveImageUrl(path: string): string {
    if (!path) return 'assets/images/placeholder.png';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  }

  private async presentToast(message: string, color: string = 'dark') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await toast.present();
  }
}
