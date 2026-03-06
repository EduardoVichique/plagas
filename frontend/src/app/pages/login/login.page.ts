import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    private loadingService: LoadingService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit() {
    // Si ya está autenticado, redirigir directamente sin pedir credenciales
    if (this.auth.isAuthenticated) {
      this.router.navigate(['/tabs/home']);
    }
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) return;
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
        this.error = err.error?.message || err.error?.error || 'Error al iniciar sesión';
      },
      complete: () => {
        this.loading = false;
        this.loadingService.hide();
      },
    });
  }

  submitMfa(): void {
    this.error = '';
    if (this.mfaForm.invalid) return;
    this.loading = true;
    this.loadingService.show();
    this.auth.loginMfa(this.tempToken, this.mfaForm.value.code).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.loading = false;
        this.loadingService.hide();
        this.error = err.error?.message || err.error?.error || 'Código MFA incorrecto';
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
}
