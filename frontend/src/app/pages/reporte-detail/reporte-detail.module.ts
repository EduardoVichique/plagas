import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReporteDetailPageRoutingModule } from './reporte-detail-routing.module';
import { ReporteDetailPage } from './reporte-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteDetailPageRoutingModule,
  ],
  declarations: [ReporteDetailPage],
})
export class ReporteDetailPageModule {}
