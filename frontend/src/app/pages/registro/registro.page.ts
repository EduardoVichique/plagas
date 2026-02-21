import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      experiencia: ['Principiante'],
      tipo_cultivo: [''],
    });
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.registro(this.form.value).subscribe({
      next: () => this.router.navigate(['/tabs/home']),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al registrarse';
      },
      complete: () => (this.loading = false),
    });
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}
