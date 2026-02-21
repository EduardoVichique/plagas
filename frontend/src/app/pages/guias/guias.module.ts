import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GuiasPageRoutingModule } from './guias-routing.module';
import { GuiasPage } from './guias.page';

@NgModule({
  imports: [CommonModule, IonicModule, GuiasPageRoutingModule],
  declarations: [GuiasPage],
})
export class GuiasPageModule {}
