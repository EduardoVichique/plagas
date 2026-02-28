import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  form: FormGroup;
  error = '';
  loading = false;
  requireMfa = false;
  mfaCode = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value.email, this.form.value.password).subscribe({
      next: (res) => {
        if (res.data?.require_mfa) {
          this.requireMfa = true;
        } else {
          this.router.navigate(['/tabs/home']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Error al iniciar sesión';
      },
      complete: () => (this.loading = false),
    });
  }

  verifyMfa(): void {
    if (!this.mfaCode || this.mfaCode.length !== 6) return;
    this.error = '';
    this.loading = true;
    this.auth.verifyMfa(this.form.value.email, this.mfaCode).subscribe({
      next: (res) => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || err.error?.error || 'Código incorrecto o expirado';
      },
      complete: () => (this.loading = false),
    });
  }

  goRegistro(): void {
    this.router.navigate(['/registro']);
  }
}
