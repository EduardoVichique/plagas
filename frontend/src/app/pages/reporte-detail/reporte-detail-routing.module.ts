import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteDetailPage } from './reporte-detail.page';

const routes: Routes = [{ path: '', component: ReporteDetailPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteDetailPageRoutingModule {}
