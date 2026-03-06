import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { AdminAuditoriasPage } from './admin-auditorias.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([{ path: '', component: AdminAuditoriasPage }])
    ],
    declarations: [AdminAuditoriasPage]
})
export class AdminAuditoriasPageModule { }
