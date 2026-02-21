import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TemaDetailPageRoutingModule } from './tema-detail-routing.module';
import { TemaDetailPage } from './tema-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TemaDetailPageRoutingModule,
  ],
  declarations: [TemaDetailPage],
})
export class TemaDetailPageModule {}
