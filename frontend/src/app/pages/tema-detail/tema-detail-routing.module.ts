import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemaDetailPage } from './tema-detail.page';

const routes: Routes = [{ path: '', component: TemaDetailPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TemaDetailPageRoutingModule {}
