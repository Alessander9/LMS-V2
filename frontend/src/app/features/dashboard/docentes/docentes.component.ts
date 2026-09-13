import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { ToastService } from '../../../core/services/';
import { getSubscriptionClass } from '../../../core/utils/';
import { DocenteRequest, DocenteResponse } from '../../../core/models/';
import { DocenteService } from '../../../core/services/';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmModalComponent],
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.css']
})
export class DocentesComponent implements OnInit {
  private docenteService = inject(DocenteService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  viewMode: 'table' | 'grid' = (localStorage.getItem('docentes_view_mode') as 'table' | 'grid') || 'table';

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
    try {
      localStorage.setItem('docentes_view_mode', mode);
    } catch (e) {
      console.warn('Could not save view mode preference', e);
    }
  }

  docentes: DocenteResponse[] = [];
  allDocentes: DocenteResponse[] = [];
  filteredDocentes: DocenteResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  selectedSort: 'fecha_desc' | 'fecha_asc' | 'nombre_asc' | 'nombre_desc' = 'fecha_desc';
  filtroEstado: 'TODOS' | 'ACTIVO' | 'INACTIVO' = 'TODOS';

  currentPage = 1;
  readonly pageSize = 10;
  totalElements = 0;
  totalPagesCount = 1;
  isLoading = false;

  get totalDocentesCount(): number {
    return this.allDocentes.length || this.totalElements;
  }

  get activosCount(): number {
    return this.allDocentes.filter(d => d.estado).length;
  }

  get inactivosCount(): number {
    return this.allDocentes.filter(d => !d.estado).length;
  }

  get conTelefonoCount(): number {
    return this.allDocentes.filter(d => !!d.telefono && d.telefono.trim() !== '').length;
  }

  get hayFiltrosActivos(): boolean {
    return this.searchQuery.trim() !== '' || this.filtroEstado !== 'TODOS';
  }

  showCreateEditModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';
  showConfirmModal = false;
  hideFormPassword = true;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAction: (() => void) | null = null;
  selectedDocente: DocenteResponse | null = null;

  docenteForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: [''],
    password: ['', [Validators.minLength(6)]]
  });

  ngOnInit(): void { this.loadDocentes(); }

  loadDocentes(): void {
    this.isLoading = true;
    this.docenteService.listarDocentes(
      0,
      1000,
      '',
      `fechaRegistro,${this.dateSortOrder}`
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.allDocentes = res.content ?? [];
        this.docentes = this.allDocentes;
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al listar docentes', err);
      }
    });
  }

  applyFilter(): void {
    let result = [...this.allDocentes];

    // Search text
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(d => 
        (d.nombres || '').toLowerCase().includes(q) ||
        (d.apellidos || '').toLowerCase().includes(q) ||
        (d.correo || '').toLowerCase().includes(q) ||
        (d.telefono || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (this.filtroEstado === 'ACTIVO') {
      result = result.filter(d => d.estado === true);
    } else if (this.filtroEstado === 'INACTIVO') {
      result = result.filter(d => d.estado === false);
    }

    // Sorting
    if (this.selectedSort === 'fecha_desc') {
      result.sort((a, b) => new Date(b.fechaRegistro || 0).getTime() - new Date(a.fechaRegistro || 0).getTime());
    } else if (this.selectedSort === 'fecha_asc') {
      result.sort((a, b) => new Date(a.fechaRegistro || 0).getTime() - new Date(b.fechaRegistro || 0).getTime());
    } else if (this.selectedSort === 'nombre_asc') {
      result.sort((a, b) => (a.nombres || '').localeCompare(b.nombres || ''));
    } else if (this.selectedSort === 'nombre_desc') {
      result.sort((a, b) => (b.nombres || '').localeCompare(a.nombres || ''));
    }

    this.filteredDocentes = result;
    this.totalElements = result.length;
    this.totalPagesCount = Math.max(1, Math.ceil(this.totalElements / this.pageSize));
    if (this.currentPage > this.totalPagesCount) {
      this.currentPage = 1;
    }
  }

  setFiltroEstado(estado: 'TODOS' | 'ACTIVO' | 'INACTIVO'): void {
    this.filtroEstado = estado;
    this.currentPage = 1;
    this.applyFilter();
  }

  onSortChange(sort: 'fecha_desc' | 'fecha_asc' | 'nombre_asc' | 'nombre_desc'): void {
    this.selectedSort = sort;
    this.applyFilter();
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.filtroEstado = 'TODOS';
    this.selectedSort = 'fecha_desc';
    this.currentPage = 1;
    this.applyFilter();
  }

  get totalPages(): number { return this.totalPagesCount; }
  
  get paginatedDocentes(): DocenteResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDocentes.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPagesCount, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getInitials(nombres: string, apellidos?: string): string {
    const n = (nombres || '').trim().charAt(0).toUpperCase();
    const a = (apellidos || '').trim().charAt(0).toUpperCase();
    return (n + a) || 'DC';
  }

  copiarCorreo(correo: string): void {
    if (!correo) return;
    navigator.clipboard.writeText(correo).then(() => {
      this.toastService.info('Correo copiado al portapapeles: ' + correo);
    }).catch(() => {
      this.toastService.info(correo);
    });
  }

  goToPage(page: number): void { 
    if (page < 1 || page > this.totalPages) return; 
    this.currentPage = page; 
  }

  previousPage(): void { 
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1); 
    }
  }

  nextPage(): void { 
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1); 
    }
  }

  trackByDocenteId(_: number, docente: DocenteResponse): number { return docente.id; }

  openCreateModal(): void {
    this.isEditMode = false; this.modalErrorMsg = ''; this.selectedDocente = null;
    this.hideFormPassword = true;
    this.docenteForm.reset({ nombres: '', apellidos: '', correo: '', telefono: '', password: '' });
    this.showCreateEditModal = true;
  }
  openEditModal(docente: DocenteResponse): void {
    this.isEditMode = true; this.modalErrorMsg = ''; this.selectedDocente = docente;
    this.hideFormPassword = true;
    this.docenteForm.patchValue({ nombres: docente.nombres, apellidos: docente.apellidos, correo: docente.correo, telefono: docente.telefono, password: '' });
    this.showCreateEditModal = true;
  }
  closeCreateEditModal(): void { this.showCreateEditModal = false; this.isFormSubmitting = false; }
  eliminarDocente(docente: DocenteResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Docente?';
    this.confirmModalMessage = `¿Estas seguro de que deseas ELIMINAR permanentemente al docente ${docente.nombres} ${docente.apellidos}? Esta accion no se puede deshacer.`;
    this.pendingAction = () => this.docenteService.eliminarDocente(docente.id).subscribe({
      next: () => { this.toastService.success('Docente eliminado permanentemente.'); this.loadDocentes(); this.showConfirmModal = false; },
      error: (err) => { this.toastService.error(err.error?.message || 'Error al eliminar el docente.'); this.showConfirmModal = false; }
    });
    this.showConfirmModal = true;
  }

  toggleEstado(docente: DocenteResponse): void {
    const nuevoEstado = !docente.estado;
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${nuevoEstado ? 'Activar' : 'Desactivar'} Docente?`;
    this.confirmModalMessage = `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} a ${docente.nombres} ${docente.apellidos}?`;
    this.pendingAction = () => this.docenteService.cambiarEstado(docente.id, nuevoEstado).subscribe({
      next: () => { docente.estado = nuevoEstado; this.toastService.success(`Docente ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`); this.showConfirmModal = false; },
      error: (err) => { this.toastService.error(err.error?.message || 'Error al cambiar el estado del docente.'); this.showConfirmModal = false; }
    });
    this.showConfirmModal = true;
  }
  confirmAction(): void { this.pendingAction?.(); }
  onSubmit(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      this.toastService.warning('Por favor completa los campos requeridos correctamente.');
      return;
    }
    const req: DocenteRequest = { nombres: this.docenteForm.value.nombres, apellidos: this.docenteForm.value.apellidos, correo: this.docenteForm.value.correo, telefono: this.docenteForm.value.telefono || '', password: this.docenteForm.value.password || undefined };
    this.isFormSubmitting = true;
    const call$ = this.isEditMode && this.selectedDocente ? this.docenteService.editarDocente(this.selectedDocente.id, req) : this.docenteService.crearDocente(req);
    call$.subscribe({
      next: () => {
        this.loadDocentes();
        this.toastService.success(this.isEditMode ? 'Docente actualizado exitosamente.' : 'Docente registrado exitosamente.');
        this.closeCreateEditModal();
      },
      error: (err) => { this.isFormSubmitting = false; this.modalErrorMsg = err.error?.message || 'Error al procesar la solicitud.'; this.toastService.error(this.modalErrorMsg, 'Error en el Servidor'); }
    });
  }

  getSubscriptionClass = getSubscriptionClass;
}
