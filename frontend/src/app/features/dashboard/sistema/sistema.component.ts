import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ToastService, AuditoriaService } from '../../../core/services/';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { EventoSistemaResponse, LoginAuditoriaResponse } from '../../../core/models/';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmModalComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.css']
})
export class SistemaComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private auditoriaService = inject(AuditoriaService);

  // Tab State
  activeTab: 'monitoreo' | 'logins' | 'eventos' = 'monitoreo';

  // System Monitor State
  statusData: any = null;
  isLoading = true;
  errorMsg = '';
  isBackupLoading = false;
  backupSuccessMsg = '';

  // Auditoria State
  loginAuditoria: LoginAuditoriaResponse[] = [];
  eventosSistema: EventoSistemaResponse[] = [];
  isLoadingAuditoria = false;
  auditoriaErrorMsg = '';
  loginSearch = '';
  eventosSearch = '';
  loginSortOrder: 'desc' | 'asc' = 'desc';
  eventosSortOrder: 'desc' | 'asc' = 'desc';
  loginPage = 1;
  eventosPage = 1;
  readonly pageSize = 10;

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadStatus();
    this.loadAuditoriaData();
  }

  setTab(tab: 'monitoreo' | 'logins' | 'eventos'): void {
    this.activeTab = tab;
  }

  loadStatus(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http.get<any>(environment.apiUrl + '/sistema/status').subscribe({
      next: (data) => {
        this.statusData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching system status:', err);
        this.errorMsg = 'No se pudo conectar con el servicio de monitoreo.';
        this.toastService.error(this.errorMsg);
        this.isLoading = false;
      }
    });
  }

  loadAuditoriaData(): void {
    this.isLoadingAuditoria = true;
    this.auditoriaErrorMsg = '';

    this.auditoriaService.getLoginAuditoria().subscribe({
      next: (data) => {
        this.loginAuditoria = data;
        this.auditoriaService.getEventosSistema().subscribe({
          next: (events) => {
            this.eventosSistema = events;
            this.isLoadingAuditoria = false;
          },
          error: (err) => {
            this.isLoadingAuditoria = false;
            this.auditoriaErrorMsg = err.error?.message || 'Error cargando eventos del sistema.';
          }
        });
      },
      error: (err) => {
        this.isLoadingAuditoria = false;
        this.auditoriaErrorMsg = err.error?.message || 'Error cargando auditoría de login.';
      }
    });
  }

  triggerBackup(): void {
    this.confirmModalType = 'warning';
    this.confirmModalTitle = '¿Generar Respaldo?';
    this.confirmModalMessage = 'Se generará una copia de seguridad de la base de datos en el servidor. Esto podría tardar unos segundos.';
    
    this.pendingAction = () => {
      this.showConfirmModal = false;
      this.isBackupLoading = true;
      this.backupSuccessMsg = '';
      this.errorMsg = '';

      this.http.post<any>(environment.apiUrl + '/sistema/backup', {}).subscribe({
        next: (res) => {
          this.isBackupLoading = false;
          this.backupSuccessMsg = res.mensaje || 'Backup generado exitosamente.';
          this.toastService.success(this.backupSuccessMsg);
          this.loadStatus();
          setTimeout(() => {
            this.backupSuccessMsg = '';
          }, 5000);
        },
        error: (err) => {
          console.error('Error triggering backup:', err);
          this.errorMsg = err.error?.mensaje || 'Error al generar el backup en el servidor.';
          this.toastService.error(this.errorMsg);
          this.isBackupLoading = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
  }

  // Auditoria Getters & Computed Properties
  get totalExitosos(): number {
    return this.loginAuditoria.filter(item => item.exitoso).length;
  }

  get totalFallidos(): number {
    return this.loginAuditoria.filter(item => !item.exitoso).length;
  }

  get usuariosBloqueados(): number {
    return this.loginAuditoria.filter(item => !!item.motivo?.toLowerCase().includes('bloque')).length;
  }

  get filteredLoginAuditoria(): LoginAuditoriaResponse[] {
    const q = this.loginSearch.trim().toLowerCase();
    return this.loginAuditoria.filter(i =>
      !q || `${i.correo ?? ''} ${i.ip ?? ''} ${i.motivo ?? ''}`.toLowerCase().includes(q)
    ).sort((a, b) => {
      const d1 = new Date(a.fecha).getTime() || 0;
      const d2 = new Date(b.fecha).getTime() || 0;
      return this.loginSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
  }

  get filteredEventosSistema(): EventoSistemaResponse[] {
    const q = this.eventosSearch.trim().toLowerCase();
    return this.eventosSistema.filter(i =>
      !q || `${i.modulo} ${i.accion} ${i.descripcion ?? ''} ${i.usuarioId ?? ''}`.toLowerCase().includes(q)
    ).sort((a, b) => {
      const d1 = new Date(a.fecha).getTime() || 0;
      const d2 = new Date(b.fecha).getTime() || 0;
      return this.eventosSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
  }

  get pagedLoginAuditoria(): LoginAuditoriaResponse[] {
    const start = (this.loginPage - 1) * this.pageSize;
    return this.filteredLoginAuditoria.slice(start, start + this.pageSize);
  }

  get pagedEventosSistema(): EventoSistemaResponse[] {
    const start = (this.eventosPage - 1) * this.pageSize;
    return this.filteredEventosSistema.slice(start, start + this.pageSize);
  }

  get loginTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLoginAuditoria.length / this.pageSize));
  }

  get eventosTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredEventosSistema.length / this.pageSize));
  }

  onLoginFilterChange(): void {
    this.loginPage = 1;
  }

  onEventosFilterChange(): void {
    this.eventosPage = 1;
  }

  previousLoginPage(): void {
    this.loginPage = Math.max(1, this.loginPage - 1);
  }

  nextLoginPage(): void {
    this.loginPage = Math.min(this.loginTotalPages, this.loginPage + 1);
  }

  previousEventosPage(): void {
    this.eventosPage = Math.max(1, this.eventosPage - 1);
  }

  nextEventosPage(): void {
    this.eventosPage = Math.min(this.eventosTotalPages, this.eventosPage + 1);
  }
}
