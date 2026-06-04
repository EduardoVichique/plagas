import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;
  mfaForm: FormGroup;
  error = '';
  loading = false;
  mfaRequired = false;
  tempToken = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private alertController: AlertController
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
    });
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/tabs/home']);
    }
  }

  async submit(): Promise<void> {
    this.error = '';

    if (this.form.invalid) {
      let msg = 'Por favor verifica los datos ingresados.';
      if (this.form.get('email')?.invalid) {
        msg = 'Ingresa un correo electrónico válido.';
      } else if (this.form.get('password')?.invalid) {
        msg = 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.';
      }
      return this.mostrarAviso(msg);
    }
    this.loading = true;
    this.loadingService.show();
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: (res) => {
        if (res.mfaRequired && res.tempToken) {
          this.mfaRequired = true;
          this.tempToken = res.tempToken;
        } else {
          this.router.navigate(['/tabs/home']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.loadingService.hide();
        const msg = err.error?.message || err.error?.error || 'Error al iniciar sesión';
        this.mostrarAviso(msg);
      },
      complete: () => {
        this.loading = false;
        this.loadingService.hide();
      },
    });
  }

  async submitMfa(): Promise<void> {
    this.error = '';
    if (this.mfaForm.invalid) {
      return this.mostrarAviso('El código MFA debe tener 6 dígitos.');
    }
    this.loading = true;
    this.loadingService.show();
    this.auth.loginMfa(this.tempToken, this.mfaForm.value.code).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.loading = false;
        this.loadingService.hide();
        const msg = err.error?.message || err.error?.error || 'Código MFA incorrecto';
        this.mostrarAviso(msg);
      },
      complete: () => {
        this.loading = false;
        this.loadingService.hide();
      }
    });
  }

  goRegistro(): void {
    this.router.navigate(['/registro']);
  }

  async mostrarAviso(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }
}
