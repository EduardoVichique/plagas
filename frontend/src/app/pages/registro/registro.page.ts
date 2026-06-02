import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      experiencia: ['Principiante'],
      tipo_cultivo: [''],
    });
  }

  async submit(): Promise<void> {
    this.error = '';

    if (this.form.invalid) {
      let msg = 'Por favor verifica los datos ingresados.';
      if (this.form.get('nombre')?.invalid) {
        msg = 'El nombre es obligatorio.';
      } else if (this.form.get('email')?.invalid) {
        msg = 'Ingresa un correo electrónico válido.';
      } else if (this.form.get('password')?.invalid) {
        msg = 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.';
      }
      return this.mostrarAviso(msg);
    }

    this.loading = true;
    this.auth.registro(this.form.value).subscribe({
      next: () => this.router.navigate(['/tabs/home']),
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || err.error?.error || 'Error al registrarse';
        this.mostrarAviso(msg);
      },
      complete: () => (this.loading = false),
    });
  }

  goLogin(): void {
    this.router.navigate(['/login']);
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
