import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReporteNuevoPage } from './reporte-nuevo.page';

const routes: Routes = [{ path: '', component: ReporteNuevoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteNuevoPageRoutingModule {}
