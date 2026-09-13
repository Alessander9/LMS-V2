import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumnoService } from '../../../core/services/';
import { AlumnoRequest, AlumnoResponse } from '../../../core/models/';
import { ReportesService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { getSubscriptionClass } from '../../../core/utils/';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  private alumnoService = inject(AlumnoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  exportarCSV(): void {
    this.reportesService.exportarAlumnos().subscribe({
      error: (err) => {
        console.error('Error al exportar alumnos:', err);
      }
    });
  }

  viewMode: 'table' | 'grid' = (localStorage.getItem('alumnos_view_mode') as 'table' | 'grid') || 'table';

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
    try {
      localStorage.setItem('alumnos_view_mode', mode);
    } catch (e) {
      console.warn('Could not save view mode preference', e);
    }
  }

  alumnos: AlumnoResponse[] = [];
  allAlumnos: AlumnoResponse[] = [];
  filteredAlumnos: AlumnoResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  nameSortOrder: 'asc' | 'desc' | '' = '';
  selectedSort: 'fecha_desc' | 'fecha_asc' | 'nombre_asc' | 'nombre_desc' = 'fecha_desc';
  
  filtroNivel: 'TODOS' | 'BASICO' | 'INTERMEDIO' | 'PREMIUM' = 'TODOS';
  filtroEstado: 'TODOS' | 'ACTIVO' | 'INACTIVO' = 'TODOS';

  currentPage = 1;
  readonly pageSize = 10;
  totalElements = 0;
  totalPagesCount = 1;
  isLoading = false;

  get totalAlumnosCount(): number {
    return this.allAlumnos.length || this.totalElements;
  }

  get activosCount(): number {
    return this.allAlumnos.filter(a => a.estado).length;
  }

  get inactivosCount(): number {
    return this.allAlumnos.filter(a => !a.estado).length;
  }

  get premiumCount(): number {
    return this.allAlumnos.filter(a => (a.nivelSuscripcion || '').toUpperCase() === 'PREMIUM').length;
  }

  get intermedioCount(): number {
    return this.allAlumnos.filter(a => (a.nivelSuscripcion || '').toUpperCase() === 'INTERMEDIO').length;
  }

  get basicoCount(): number {
    return this.allAlumnos.filter(a => (a.nivelSuscripcion || '').toUpperCase() === 'BASICO').length;
  }

  get hayFiltrosActivos(): boolean {
    return this.searchQuery.trim() !== '' || this.filtroNivel !== 'TODOS' || this.filtroEstado !== 'TODOS';
  }

  // Modal controls
  showCreateEditModal = false;
  showDetailModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';
  hideDetailPassword = true;
  hideFormPassword = true;

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAlumnoAction: (() => void) | null = null;

  selectedAlumno: AlumnoResponse | null = null;

  alumnoForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern('^[0-9]{9}$')]],
    nivelSuscripcionId: [1, [Validators.required]],
    password: ['', [Validators.minLength(6)]],
    estado: [true]
  });

  setNivel(id: number): void {
    this.alumnoForm.patchValue({ nivelSuscripcionId: id });
  }

  get nivelSeleccionado(): number {
    return Number(this.alumnoForm.get('nivelSuscripcionId')?.value) || 1;
  }

  setEstado(estado: boolean): void {
    this.alumnoForm.patchValue({ estado });
  }

  get isEstadoActivo(): boolean {
    return this.alumnoForm.get('estado')?.value === true;
  }

  ngOnInit(): void {
    this.loadAlumnos();
  }

  loadAlumnos(): void {
    this.isLoading = true;
    // Load all without restrictive pagination to enable client-side multi-dimensional filtering & counters
    this.alumnoService.listarAlumnos(
      0,
      1000,
      '',
      `fechaRegistro,${this.dateSortOrder}`,
      true
    ).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.allAlumnos = data.content ?? [];
        this.alumnos = this.allAlumnos;
        this.applyFilter();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al listar alumnos', err);
      }
    });
  }

  applyFilter(): void {
    let result = [...this.allAlumnos];

    // Search text filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        (a.nombres || '').toLowerCase().includes(q) ||
        (a.apellidos || '').toLowerCase().includes(q) ||
        (a.correo || '').toLowerCase().includes(q) ||
        (a.telefono || '').toLowerCase().includes(q)
      );
    }

    // Subscription level filter
    if (this.filtroNivel !== 'TODOS') {
      result = result.filter(a => (a.nivelSuscripcion || '').toUpperCase() === this.filtroNivel);
    }

    // Status filter
    if (this.filtroEstado === 'ACTIVO') {
      result = result.filter(a => a.estado === true);
    } else if (this.filtroEstado === 'INACTIVO') {
      result = result.filter(a => a.estado === false);
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

    this.filteredAlumnos = result;
    this.totalElements = result.length;
    this.totalPagesCount = Math.max(1, Math.ceil(this.totalElements / this.pageSize));
    if (this.currentPage > this.totalPagesCount) {
      this.currentPage = 1;
    }
  }

  setFiltroNivel(nivel: 'TODOS' | 'BASICO' | 'INTERMEDIO' | 'PREMIUM'): void {
    this.filtroNivel = nivel;
    this.currentPage = 1;
    this.applyFilter();
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
    this.filtroNivel = 'TODOS';
    this.filtroEstado = 'TODOS';
    this.selectedSort = 'fecha_desc';
    this.currentPage = 1;
    this.applyFilter();
  }

  get totalPages(): number {
    return this.totalPagesCount;
  }

  get paginatedAlumnos(): AlumnoResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAlumnos.slice(start, start + this.pageSize);
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
    return (n + a) || 'AL';
  }

  getAvatarColorClass(nivel?: string): string {
    const n = (nivel || '').toUpperCase();
    if (n === 'PREMIUM') {
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60';
    }
    if (n === 'INTERMEDIO') {
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700/60';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
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

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  trackByAlumnoId(_: number, alumno: AlumnoResponse): number {
    return alumno.id;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedAlumno = null;
    this.hideFormPassword = true;
    this.alumnoForm.reset({
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      nivelSuscripcionId: 1,
      estado: true
    });
    this.showCreateEditModal = true;
  }

  openEditModal(alumno: AlumnoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedAlumno = alumno;
    this.hideFormPassword = true;
    
    // Map subscription name back to numeric ID
    let subId = 1;
    if (alumno.nivelSuscripcion === 'INTERMEDIO') {
      subId = 2;
    } else if (alumno.nivelSuscripcion === 'PREMIUM') {
      subId = 3;
    }

    this.alumnoForm.patchValue({
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      correo: alumno.correo,
      telefono: alumno.telefono,
      nivelSuscripcionId: subId,
      estado: alumno.estado
    });
    this.showCreateEditModal = true;
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal = false;
    this.isFormSubmitting = false;
  }

  openDetailModal(alumno: AlumnoResponse): void {
    this.selectedAlumno = alumno;
    this.hideDetailPassword = true;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedAlumno = null;
  }

  eliminarAlumno(alumno: AlumnoResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Alumno?';
    this.confirmModalMessage = `¿Estás seguro de que deseas ELIMINAR permanentemente al alumno ${alumno.nombres} ${alumno.apellidos}? Esta accion no se puede deshacer y eliminara todos sus datos asociados.`;
    this.pendingAlumnoAction = () => {
      this.alumnoService.eliminarAlumno(alumno.id).subscribe({
        next: () => {
          this.toastService.success('Alumno eliminado permanentemente.');
          this.loadAlumnos();
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el alumno.');
          this.showConfirmModal = false;
        }
      });
    };
    this.showConfirmModal = true;
  }

  toggleEstado(alumno: AlumnoResponse): void {
    const nuevoEstado = !alumno.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${accion} Alumno?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} la cuenta del alumno ${alumno.nombres} ${alumno.apellidos}?`;
    
    this.pendingAlumnoAction = () => {
      this.alumnoService.cambiarEstado(alumno.id, nuevoEstado).subscribe({
        next: () => {
          alumno.estado = nuevoEstado;
          this.toastService.success(`Alumno ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del alumno.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAlumnoAction) {
      this.pendingAlumnoAction();
    }
  }

  onSubmit(): void {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: AlumnoRequest = {
      nombres: this.alumnoForm.value.nombres,
      apellidos: this.alumnoForm.value.apellidos,
      correo: this.alumnoForm.value.correo,
      telefono: this.alumnoForm.value.telefono || '',
      nivelSuscripcionId: Number(this.alumnoForm.value.nivelSuscripcionId),
      password: this.alumnoForm.value.password || undefined
    };

    if (this.isEditMode && this.selectedAlumno) {
      this.alumnoService.editarAlumno(this.selectedAlumno.id, req).subscribe({
        next: () => {
          // Check if state changed, and update via PATCH since backend PUT doesn't update state
          const stateChanged = this.alumnoForm.value.estado !== this.selectedAlumno!.estado;
          if (stateChanged) {
            this.alumnoService.cambiarEstado(this.selectedAlumno!.id, this.alumnoForm.value.estado).subscribe({
              next: () => {
                this.loadAlumnos();
                this.toastService.success('Datos de alumno y estado actualizados exitosamente.');
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadAlumnos();
            this.toastService.success('Datos de alumno actualizados exitosamente.');
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.alumnoService.crearAlumno(req).subscribe({
        next: () => {
          this.loadAlumnos();
          this.toastService.success('Alumno registrado exitosamente.');
          this.closeCreateEditModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
    this.toastService.error(this.modalErrorMsg, 'Error en el Servidor');
  }

  getSubscriptionClass = getSubscriptionClass;
}
