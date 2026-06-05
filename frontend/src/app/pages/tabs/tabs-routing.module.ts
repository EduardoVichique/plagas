import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [{ path: '', loadChildren: () => import('../home/home.module').then((m) => m.HomePageModule) }]
      },
      {
        path: 'reportes',
        children: [{ path: '', loadChildren: () => import('../reportes/reportes.module').then((m) => m.ReportesPageModule) }]
      },
      {
        path: 'scanner',
        children: [{ path: '', loadChildren: () => import('../scanner/scanner.module').then((m) => m.ScannerPageModule) }]
      },
      {
        path: 'mapa',
        children: [{ path: '', loadChildren: () => import('../mapa/mapa.module').then((m) => m.MapaPageModule) }]
      },
      {
        path: 'foro',
        children: [{ path: '', loadChildren: () => import('../foro/foro.module').then((m) => m.ForoPageModule) }]
      },
      {
        path: 'guias',
        children: [{ path: '', loadChildren: () => import('../guias/guias.module').then((m) => m.GuiasPageModule) }]
      },
      {
        path: 'perfil',
        children: [{ path: '', loadChildren: () => import('../perfil/perfil.module').then((m) => m.PerfilPageModule) }]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
