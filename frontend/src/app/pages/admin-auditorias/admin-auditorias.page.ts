import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/interfaces/api-response.interface';
import { LoadingService } from '../../core/services/loading.service';
import { IonicModule } from "@ionic/angular";

interface AuditLog {
    id: number;
    usuario_id: number | null;
    accion: string;
    entidad: string;
    entidad_id: number | null;
    detalles: string;
    ip: string;
    created_at: string;
}

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-auditorias',
    templateUrl: './admin-auditorias.page.html',
    styleUrls: ['./admin-auditorias.page.scss'],
})
export class AdminAuditoriasPage implements OnInit {
    logs: AuditLog[] = [];
    loading = true;
    error = '';

    constructor(
        private http: HttpClient,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.cargarLogs();
    }

    cargarLogs() {
        this.loading = true;
        this.loadingService.show();
        this.http.get<ApiResponse<AuditLog[]>>(`${environment.apiUrl}/users/admin/auditorias`).subscribe({
            next: (res) => {
                this.logs = res.data;
                this.loading = false;
                this.loadingService.hide();
            },
            error: (err) => {
                console.error(err);
                this.error = 'Error cargando los registros de auditoría';
                this.loading = false;
                this.loadingService.hide();
            }
        });
    }
}
