import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage {
  perfil: any = null;
  user$ = this.auth.user$;
  loading = true;

  mfaQR: string | null = null;
  mfaSecret: string | null = null;
  mfaCode: string = '';
  mfaError: string = '';

  // Edit Mode Properties
  editMode = false;
  nombreEdit = '';
  apellidoEdit = '';
  experienciaEdit = '';
  tipoCultivoEdit = '';
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  editError = '';
  editLoading = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ionViewDidEnter(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const user = this.auth.currentUser;
    if (!user) return;
    this.loading = true;
    this.api.get<any>('/users/perfil').subscribe({
      next: (res) => (this.perfil = res),
      error: () => (this.perfil = null),
      complete: () => (this.loading = false),
    });
  }

  iniciarEdicion(): void {
    if (this.perfil && this.perfil.user) {
      this.nombreEdit = this.perfil.user.nombre || '';
      this.apellidoEdit = this.perfil.user.apellido || '';
      this.experienciaEdit = this.perfil.user.experiencia || '';
      this.tipoCultivoEdit = this.perfil.user.tipo_cultivo || '';
      this.avatarPreview = this.perfil.user.avatar_url || null;
      this.avatarFile = null;
      this.editError = '';
      this.editMode = true;
    }
  }

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.avatarPreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async confirmarCambios() {
    const alert = await this.alertController.create({
      header: 'Advertencia',
      message: '¿Está seguro de que desea guardar los cambios en su perfil?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edición cancelada por el usuario');
          }
        },
        {
          text: 'Continuar',
          handler: () => {
            this.guardarPerfil();
          }
        }
      ]
    });
    await alert.present();
  }

  guardarPerfil(): void {
    if (!this.nombreEdit.trim()) {
      this.editError = 'El nombre es obligatorio';
      return;
    }
    this.editLoading = true;
    this.editError = '';

    const formData = new FormData();
    formData.append('nombre', this.nombreEdit);
    formData.append('apellido', this.apellidoEdit);
    formData.append('experiencia', this.experienciaEdit);
    formData.append('tipo_cultivo', this.tipoCultivoEdit);
    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    this.api.putFormData<any>('/users/perfil', formData).subscribe({
      next: (res) => {
        if (this.perfil && this.perfil.user) {
          this.perfil.user.nombre = res.nombre;
          this.perfil.user.apellido = res.apellido;
          this.perfil.user.experiencia = res.experiencia;
          this.perfil.user.tipo_cultivo = res.tipo_cultivo;
          this.perfil.user.avatar_url = res.avatar_url;
        }
        this.auth.refreshMe().subscribe();
        this.editMode = false;
        this.editLoading = false;
      },
      error: (err) => {
        this.editError = err.error?.message || 'Error al actualizar perfil';
        this.editLoading = false;
      }
    });
  }

  generarMfa(): void {
    this.auth.generateMfa().subscribe({
      next: (res) => {
        this.mfaQR = res.qrCodeImage;
        this.mfaSecret = res.secret;
        this.mfaError = '';
        this.mfaCode = '';
      },
      error: (err) => {
        this.mfaError = err.error?.message || 'Error al generar MFA';
      }
    });
  }

  verificarMfa(): void {
    if (!this.mfaCode || this.mfaCode.length !== 6) {
      this.mfaError = 'El código debe ser de 6 dígitos';
      return;
    }
    this.auth.verifyMfa(this.mfaCode).subscribe({
      next: () => {
        if (this.perfil && this.perfil.user) {
          this.perfil.user.mfa_enabled = true;
        }
        this.auth.refreshMe().subscribe();
        this.mfaQR = null;
        this.mfaCode = '';
        this.mfaError = '';
      },
      error: (err) => {
        this.mfaError = err.error?.message || 'Código incorrecto';
      }
    });
  }

  cancelarMfa(): void {
    this.mfaQR = null;
    this.mfaCode = '';
    this.mfaError = '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  irAuditorias() {
    this.router.navigate(['/admin/auditorias']);
  }
}
