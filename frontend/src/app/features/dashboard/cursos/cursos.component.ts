import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CursoService } from '../../../core/services/';
import { CursoRequest, CursoResponse } from '../../../core/models/';
import { ReportesService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';
import { UsuarioService, DocenteOption } from '../../../core/services/';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { getSubscriptionClass, formatNiveles } from '../../../core/utils/';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ConfirmModalComponent
  ],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);

  irADetalle(id: number): void {
    console.log('Intentando navegar a curso:', id);
    this.router.navigate(['/dashboard/cursos', id]).then(
      success => {
        if (!success) {
          console.error('Navegación rechazada');
          alert('Error: La navegación al detalle del curso fue rechazada.');
        }
      },
      error => {
        console.error('Error de navegación:', error);
        alert('Error al navegar al curso: ' + error);
      }
    );
  }

  exportarCSV(): void {
    this.reportesService.exportarCursos().subscribe({
      error: (err) => {
        console.error('Error al exportar cursos:', err);
      }
    });
  }

  viewMode: 'table' | 'grid' = (localStorage.getItem('cursos_view_mode') as 'table' | 'grid') || 'table';

  setViewMode(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
    try {
      localStorage.setItem('cursos_view_mode', mode);
    } catch (e) {
      console.warn('Could not save view mode preference', e);
    }
  }

  cursos: CursoResponse[] = [];
  filteredCursos: CursoResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 6;
  totalElements = 0;
  totalPagesCount = 1;
  summaryCursos: CursoResponse[] = [];

  get totalCursos(): number {
    return this.totalElements;
  }

  get activeCursos(): number {
    return this.summaryCursos.filter(c => c.estado).length;
  }

  get premiumCursos(): number {
    return this.summaryCursos.filter(c => c.nivelesSuscripcion?.includes('PREMIUM')).length;
  }

  // Modal controls
  showCreateEditModal = false;
  showDetailModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingCursoAction: (() => void) | null = null;

  selectedCurso: CursoResponse | null = null;
  selectedSuscripcionIds: number[] = [];
  docentes: DocenteOption[] = [];
  docentesFiltrados: DocenteOption[] = [];
  docenteSearch = '';
  selectedDocenteId: number | null = null;
  showDocenteDropdown = false;

  // Image upload state
  imageSourceType: 'file' | 'url' = 'file';
  selectedFileName = '';
  selectedFileSize = '';
  isDraggingFile = false;

  setImageSourceType(type: 'file' | 'url'): void {
    this.imageSourceType = type;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingFile = false;
  }

  private processFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Solo se permiten archivos de imagen (.jpg, .png, .webp, .svg, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('La imagen no debe superar los 5 MB.');
      return;
    }

    this.selectedFileName = file.name;
    this.selectedFileSize = (file.size / 1024).toFixed(1) + ' KB';

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.cursoForm.patchValue({ imagenPortada: base64String });
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage(): void {
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.cursoForm.patchValue({ imagenPortada: '' });
  }

  setEstado(estado: boolean): void {
    this.cursoForm.patchValue({ estado });
  }

  get isEstadoActivo(): boolean {
    return this.cursoForm.get('estado')?.value === true;
  }

  cursoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    imagenPortada: [''],
    docenteId: [null],
    estado: [true]
  });

  ngOnInit(): void {
    this.loadCursos();
    this.loadDocentes();
    this.loadCourseSummary();
  }

  loadDocentes(): void {
    this.usuarioService.listarDocentes(0, 1).subscribe({
      next: (data) => {
        const total = data.totalElements ?? data.content?.length ?? 0;
        this.usuarioService.listarDocentes(0, Math.max(total, 1)).subscribe({
          next: (fullData) => {
            this.docentes = fullData.content || [];
            this.docentesFiltrados = this.docentes;
          },
          error: (err) => console.error('Error loading docentes', err)
        });
      },
      error: (err) => console.error('Error loading docentes', err)
    });
  }

  loadCourseSummary(): void {
    this.cursoService.listarCursos(0, 1, '', 'fechaCreacion,desc').subscribe({
      next: (data) => {
        const total = data.totalElements ?? data.content?.length ?? 0;
        this.cursoService.listarCursos(0, Math.max(total, 1), '', 'fechaCreacion,desc').subscribe({
          next: (fullData) => {
            this.summaryCursos = fullData.content ?? [];
          },
          error: (err) => console.error('Error al cargar resumen de cursos', err)
        });
      },
      error: (err) => console.error('Error al cargar resumen de cursos', err)
    });
  }

  filterDocentes(): void {
    const q = this.docenteSearch.trim().toLowerCase();
    this.docentesFiltrados = !q ? this.docentes : this.docentes.filter(d =>
      `${d.nombres} ${d.apellidos}`.toLowerCase().includes(q) ||
      d.correo.toLowerCase().includes(q)
    );
    this.showDocenteDropdown = true;
  }

  openDocenteDropdown(): void {
    this.showDocenteDropdown = true;
    this.filterDocentes();
  }

  selectDocente(docente: DocenteOption): void {
    this.selectedDocenteId = docente.id;
    this.docenteSearch = `${docente.nombres} ${docente.apellidos} — ${docente.correo}`;
    this.cursoForm.patchValue({ docenteId: docente.id });
    this.showDocenteDropdown = false;
  }

  loadCursos(): void {
    this.cursoService.listarCursos(
      this.currentPage - 1,
      this.pageSize,
      this.searchQuery,
      `fechaCreacion,${this.dateSortOrder}`
    ).subscribe({
      next: (data) => {
        this.cursos = data.content ?? [];
        this.filteredCursos = this.cursos;
        this.totalElements = data.totalElements ?? this.cursos.length;
        this.totalPagesCount = data.totalPages ?? Math.max(1, Math.ceil(this.totalElements / this.pageSize));
        if (this.currentPage > this.totalPagesCount) {
          this.currentPage = this.totalPagesCount;
        }
      },
      error: (err) => {
        console.error('Error al listar cursos', err);
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadCursos();
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadCursos();
  }

  get totalPages(): number {
    return this.totalPagesCount;
  }

  get paginatedCursos(): CursoResponse[] {
    return this.filteredCursos;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCursos();
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  trackByCursoId(_: number, curso: CursoResponse): number {
    return curso.id;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedCurso = null;
    this.selectedSuscripcionIds = [1]; // Default to Básico
    this.selectedDocenteId = null;
    this.docenteSearch = '';
    this.showDocenteDropdown = false;
    this.imageSourceType = 'file';
    this.selectedFileName = '';
    this.selectedFileSize = '';
    this.cursoForm.reset({
      nombre: '',
      descripcion: '',
      imagenPortada: '',
      docenteId: null,
      estado: true
    });
    this.showCreateEditModal = true;
  }

  openEditModal(curso: CursoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedCurso = curso;

    this.selectedSuscripcionIds = [];
    if (curso.nivelesSuscripcion) {
      if (curso.nivelesSuscripcion.includes('BASICO')) this.selectedSuscripcionIds.push(1);
      if (curso.nivelesSuscripcion.includes('INTERMEDIO')) this.selectedSuscripcionIds.push(2);
      if (curso.nivelesSuscripcion.includes('PREMIUM')) this.selectedSuscripcionIds.push(3);
    }

    this.selectedDocenteId = curso.docenteId || null;
    const docente = this.docentes.find(d => d.id === curso.docenteId);
    this.docenteSearch = docente ? `${docente.nombres} ${docente.apellidos} — ${docente.correo}` : '';
    
    this.selectedFileName = '';
    this.selectedFileSize = '';
    if (curso.imagenPortada && curso.imagenPortada.startsWith('data:image')) {
      this.imageSourceType = 'file';
      this.selectedFileName = 'Imagen cargada en el curso';
    } else if (curso.imagenPortada && curso.imagenPortada.startsWith('http')) {
      this.imageSourceType = 'url';
    } else {
      this.imageSourceType = 'file';
    }

    this.cursoForm.patchValue({
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      imagenPortada: curso.imagenPortada,
      docenteId: curso.docenteId || null,
      estado: curso.estado
    });
    this.showCreateEditModal = true;
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal = false;
    this.isFormSubmitting = false;
  }

  openDetailModal(curso: CursoResponse): void {
    this.selectedCurso = curso;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCurso = null;
  }

  eliminarCurso(curso: CursoResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Curso?';
    this.confirmModalMessage = `¿Estás seguro de que deseas ELIMINAR permanentemente el curso "${curso.nombre}"? Esta acción no se puede deshacer. Se eliminarán todos los módulos, videos, materiales, matrículas y certificados asociados.`;
    
    this.pendingCursoAction = () => {
      this.cursoService.eliminarCurso(curso.id).subscribe({
        next: () => {
          this.toastService.success('Curso eliminado permanentemente.');
          this.loadCursos();
          this.loadCourseSummary();
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el curso.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  toggleEstado(curso: CursoResponse): void {
    const nuevoEstado = !curso.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${accion} Curso?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} el curso "${curso.nombre}"?`;
    
    this.pendingCursoAction = () => {
      this.cursoService.cambiarEstado(curso.id, nuevoEstado).subscribe({
        next: () => {
          curso.estado = nuevoEstado;
          this.loadCourseSummary();
          this.toastService.success(`Curso ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del curso.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingCursoAction) {
      this.pendingCursoAction();
    }
  }

  toggleNivel(id: number): void {
    const idx = this.selectedSuscripcionIds.indexOf(id);
    if (idx > -1) {
      if (this.selectedSuscripcionIds.length > 1) {
        this.selectedSuscripcionIds.splice(idx, 1);
      }
    } else {
      this.selectedSuscripcionIds.push(id);
    }
  }

  isNivelSelected(id: number): boolean {
    return this.selectedSuscripcionIds.includes(id);
  }

  onSubmit(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: CursoRequest = {
      nombre: this.cursoForm.value.nombre,
      descripcion: this.cursoForm.value.descripcion,
      imagenPortada: this.cursoForm.value.imagenPortada || '',
      nivelesSuscripcionIds: this.selectedSuscripcionIds,
      docenteId: this.cursoForm.value.docenteId || null
    };

    if (this.isEditMode && this.selectedCurso) {
      this.cursoService.editarCurso(this.selectedCurso.id, req).subscribe({
        next: () => {
          const stateChanged = this.cursoForm.value.estado !== this.selectedCurso!.estado;
          if (stateChanged) {
            this.cursoService.cambiarEstado(this.selectedCurso!.id, this.cursoForm.value.estado).subscribe({
              next: () => {
                this.loadCursos();
                this.loadCourseSummary();
                this.toastService.success('Curso y estado actualizados exitosamente.');
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadCursos();
            this.loadCourseSummary();
            this.toastService.success('Curso actualizado exitosamente.');
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.cursoService.crearCurso(req).subscribe({
        next: () => {
          this.loadCursos();
          this.loadCourseSummary();
          this.toastService.success('Curso creado exitosamente.');
          this.closeCreateEditModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  onPreviewImgError(): void {
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
    this.toastService.error(this.modalErrorMsg, 'Error');
  }

  formatNiveles = formatNiveles;
  getSubscriptionClass = getSubscriptionClass;
}
