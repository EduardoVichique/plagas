import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MapaPageRoutingModule } from './mapa-routing.module';
import { MapaPage } from './mapa.page';

@NgModule({
  imports: [CommonModule, IonicModule, MapaPageRoutingModule],
  declarations: [MapaPage],
})
export class MapaPageModule {}
