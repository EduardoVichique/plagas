import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginPageModule) },
  { path: 'registro', loadChildren: () => import('./pages/registro/registro.module').then((m) => m.RegistroPageModule) },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: 'reporte-nuevo',
    loadChildren: () => import('./pages/reporte-nuevo/reporte-nuevo.module').then((m) => m.ReporteNuevoPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'reporte/:id',
    loadChildren: () => import('./pages/reporte-detail/reporte-detail.module').then((m) => m.ReporteDetailPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'tema/:id',
    loadChildren: () => import('./pages/tema-detail/tema-detail.module').then((m) => m.TemaDetailPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'guia/:id',
    loadChildren: () => import('./pages/guia-detail/guia-detail.module').then((m) => m.GuiaDetailPageModule),
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: 'tabs/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
