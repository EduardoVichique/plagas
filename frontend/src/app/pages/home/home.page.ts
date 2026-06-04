import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  user$ = this.auth.user$;
  reportesRecientes: any[] = [];
  loading = true;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router
  ) { }

  ionViewDidEnter(): void {
    this.loadReportes();
  }

  loadReportes(): void {
    this.api.get<{ reportes: any[] }>('/reportes', { limit: '5' }).subscribe({
      next: (res) => (this.reportesRecientes = res.reportes || []),
      error: () => (this.reportesRecientes = []),
      complete: () => (this.loading = false),
    });
  }
}
