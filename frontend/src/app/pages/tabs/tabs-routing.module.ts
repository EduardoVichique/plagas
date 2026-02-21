import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: 'home', loadChildren: () => import('../home/home.module').then((m) => m.HomePageModule) },
      { path: 'reportes', loadChildren: () => import('../reportes/reportes.module').then((m) => m.ReportesPageModule) },
      { path: 'mapa', loadChildren: () => import('../mapa/mapa.module').then((m) => m.MapaPageModule) },
      { path: 'foro', loadChildren: () => import('../foro/foro.module').then((m) => m.ForoPageModule) },
      { path: 'guias', loadChildren: () => import('../guias/guias.module').then((m) => m.GuiasPageModule) },
      { path: 'perfil', loadChildren: () => import('../perfil/perfil.module').then((m) => m.PerfilPageModule) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
