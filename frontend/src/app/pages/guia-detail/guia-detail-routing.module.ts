import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuiaDetailPage } from './guia-detail.page';

const routes: Routes = [{ path: '', component: GuiaDetailPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuiaDetailPageRoutingModule {}
