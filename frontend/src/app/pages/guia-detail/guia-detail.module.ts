import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GuiaDetailPageRoutingModule } from './guia-detail-routing.module';
import { GuiaDetailPage } from './guia-detail.page';

@NgModule({
  imports: [CommonModule, IonicModule, GuiaDetailPageRoutingModule],
  declarations: [GuiaDetailPage],
})
export class GuiaDetailPageModule {}
