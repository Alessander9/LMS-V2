import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../../core/services/';
import { AuthService } from '../../../core/services/';
import { EventoSistemaResponse, LoginAuditoriaResponse } from '../../../core/models/';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab: 'login' | 'eventos' = 'login';
  isLoading = true;
  errorMsg = '';
  loginSearch = '';
  eventosSearch = '';
  loginSortOrder: 'desc' | 'asc' = 'desc';
  eventosSortOrder: 'desc' | 'asc' = 'desc';
  loginPage = 1;
  eventosPage = 1;
  readonly pageSize = 10;

  loginAuditoria: LoginAuditoriaResponse[] = [];
  eventosSistema: EventoSistemaResponse[] = [];

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        if (profile.rol !== 'ADMINISTRADOR') {
          this.router.navigate(['/dashboard']);
          return;
        }
        this.loadData();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.auditoriaService.getLoginAuditoria().subscribe({
      next: (data) => {
        this.loginAuditoria = data;
        this.auditoriaService.getEventosSistema().subscribe({
          next: (events) => {
            this.eventosSistema = events;
            this.isLoading = false;
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  setTab(tab: 'login' | 'eventos'): void {
    this.activeTab = tab;
  }

  get totalExitosos(): number {
    return this.loginAuditoria.filter(item => item.exitoso).length;
  }

  get totalFallidos(): number {
    return this.loginAuditoria.filter(item => !item.exitoso).length;
  }

  get usuariosBloqueados(): number {
    return this.loginAuditoria.filter(item => !!item.motivo?.toLowerCase().includes('bloque')).length;
  }

  get ultimosAccesos(): LoginAuditoriaResponse[] {
    return this.loginAuditoria.slice(0, 5);
  }

  get ultimosEventos(): EventoSistemaResponse[] {
    return this.eventosSistema.slice(0, 5);
  }

  private handleError(err: any): void {
    this.isLoading = false;
    this.errorMsg = err.error?.message || 'No se pudo cargar la auditoría.';
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
