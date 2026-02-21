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

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

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

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
