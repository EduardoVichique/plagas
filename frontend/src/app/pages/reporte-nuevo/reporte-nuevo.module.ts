import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReporteNuevoPageRoutingModule } from './reporte-nuevo-routing.module';
import { ReporteNuevoPage } from './reporte-nuevo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteNuevoPageRoutingModule,
  ],
  declarations: [ReporteNuevoPage],
})
export class ReporteNuevoPageModule {}
