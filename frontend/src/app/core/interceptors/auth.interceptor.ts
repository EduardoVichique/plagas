import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Sesión expirada o token inválido
          this.auth.logout();
          this.presentToast('Se expiró la sesión o necesitas iniciarla nuevamente.');
          this.router.navigate(['/login'], { replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }

  private async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3500,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
        }
      ]
    });
    await toast.present();
  }
}
