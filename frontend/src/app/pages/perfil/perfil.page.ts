import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

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

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
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
