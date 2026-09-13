import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { ModuloService, AuthService } from '../../../core/services/';
import { MaterialService } from '../../../core/services/';
import { ModuloResponse } from '../../../core/models/';
import { MaterialResponse } from '../../../core/models/';
import { ArchivoProtegidoService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { formatBytes, getFileIcon, getCleanFileType, getFileExtension } from '../../../core/utils/';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.css']
})
export class MaterialesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moduloService = inject(ModuloService);
  private materialService = inject(MaterialService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  isDocente = false;

  moduloId!: number;
  modulo: ModuloResponse | null = null;
  materiales: MaterialResponse[] = [];
  filteredMateriales: MaterialResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;
  totalElements = 0;
  totalPagesCount = 1;

  // Modal controls
  showMaterialModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  isFormSubmitted = false;
  modalErrorMsg = '';
  uploadProgress = 0;
  isUploading = false;

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingMaterialAction: (() => void) | null = null;

  selectedMaterial: MaterialResponse | null = null;
  selectedFile: File | null = null;

  materialForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    estado: [true]
  });

  ngOnInit(): void {
    this.authService.getProfile().subscribe(user => {
      if (user && user.rol === 'DOCENTE') {
        this.isDocente = true;
      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.moduloId = Number(idParam);
        this.loadModuloData();
      } else {
        this.router.navigate([this.isDocente ? '/dashboard/mis-cursos-docente' : '/dashboard/cursos']);
      }
    });
  }

  loadModuloData(): void {
    this.moduloService.obtenerModulo(this.moduloId).subscribe({
      next: (data) => {
        this.modulo = data;
        this.loadMateriales();
      },
      error: (err) => {
        console.error('Error al obtener modulo', err);
        this.router.navigate([this.isDocente ? '/dashboard/mis-cursos-docente' : '/dashboard/cursos']);
      }
    });
  }

  loadMateriales(): void {
    this.materialService.listarMaterialesPorModulo(
      this.moduloId,
      this.currentPage - 1,
      this.pageSize,
      this.searchQuery,
      `fechaSubida,${this.dateSortOrder}`
    ).subscribe({
      next: (data) => {
        this.materiales = data.content ?? [];
        this.filteredMateriales = this.materiales;
        this.totalElements = data.totalElements ?? this.materiales.length;
        this.totalPagesCount = data.totalPages ?? Math.max(1, Math.ceil(this.totalElements / this.pageSize));
        if (this.currentPage > this.totalPagesCount) {
          this.currentPage = this.totalPagesCount;
        }
      },
      error: (err) => {
        console.error('Error al listar materiales', err);
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadMateriales();
  }

  get totalPages(): number {
    return this.totalPagesCount;
  }

  get paginatedMateriales(): MaterialResponse[] {
    return this.filteredMateriales;
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadMateriales();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadMateriales();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedMaterial = null;
    this.selectedFile = null;
    this.isFormSubmitted = false;
    this.isFormSubmitting = false;
    this.materialForm.reset({
      nombre: '',
      estado: true
    });
    this.showMaterialModal = true;
  }

  openEditModal(material: MaterialResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedMaterial = material;
    this.selectedFile = null;
    this.isFormSubmitted = false;
    this.isFormSubmitting = false;
    
    this.materialForm.patchValue({
      nombre: material.nombre,
      estado: material.estado
    });
    this.showMaterialModal = true;
  }

  closeMaterialModal(): void {
    this.showMaterialModal = false;
    this.isFormSubmitting = false;
    this.isFormSubmitted = false;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.selectedFile = null;
  }

  isDraggingFile = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
  }

  onDropFile(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.validateAndSetFile(file);
    }
  }

  validateAndSetFile(file: File): void {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const dangerousExts = ['exe', 'bat', 'sh', 'cmd', 'js', 'com', 'scr', 'msi', 'vbs'];
    if (fileExt && dangerousExts.includes(fileExt)) {
      this.modalErrorMsg = 'No se permiten archivos ejecutables o potencialmente peligrosos (.exe, .bat, .js, etc.).';
      this.selectedFile = null;
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      this.modalErrorMsg = 'El archivo supera el límite de tamaño permitido (100MB).';
      this.selectedFile = null;
      return;
    }
    this.modalErrorMsg = '';
    this.selectedFile = file;
    if (!this.materialForm.get('nombre')?.value) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      this.materialForm.patchValue({ nombre: nameWithoutExt });
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.modalErrorMsg = '';
  }

  setEstado(estado: boolean): void {
    this.materialForm.patchValue({ estado });
  }

  get isEstadoActivo(): boolean {
    return this.materialForm.get('estado')?.value === true;
  }

  eliminarMaterial(material: MaterialResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Material?';
    this.confirmModalMessage = `¿Estás seguro de que deseas ELIMINAR permanentemente el material "${material.nombre}"? Esta acción no se puede deshacer y eliminará el archivo físico.`;
    
    this.pendingMaterialAction = () => {
      this.materialService.eliminarMaterial(material.id).subscribe({
        next: () => {
          this.toastService.success('Material eliminado permanentemente.');
          this.loadMateriales();
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el material.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  toggleEstado(material: MaterialResponse): void {
    const nuevoEstado = !material.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'warning';
    this.confirmModalTitle = `¿${accion} Material?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} el material "${material.nombre}"?`;
    
    this.pendingMaterialAction = () => {
      this.materialService.cambiarEstado(material.id, nuevoEstado).subscribe({
        next: () => {
          material.estado = nuevoEstado;
          this.toastService.success(`Material "${material.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del material.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingMaterialAction) {
      this.pendingMaterialAction();
    }
  }

  onSubmit(): void {
    this.isFormSubmitted = true;
    
    if (this.materialForm.invalid) {
      this.materialForm.markAllAsTouched();
      this.modalErrorMsg = 'El nombre del recurso es obligatorio.';
      this.toastService.warning('El nombre del recurso es obligatorio.');
      return;
    }

    if (!this.isEditMode && !this.selectedFile) {
      this.modalErrorMsg = 'Debe seleccionar un archivo físico para subir.';
      this.toastService.warning('Debe seleccionar un archivo físico para subir.');
      return;
    }

    this.isFormSubmitting = true;
    this.uploadProgress = 0;
    this.isUploading = true;
    this.modalErrorMsg = '';

    const nombre = this.materialForm.value.nombre;

    if (this.isEditMode && this.selectedMaterial) {
      this.materialService.editarMaterial(this.selectedMaterial.id, nombre, this.selectedFile || undefined).subscribe({
        next: (res) => {
          const stateChanged = this.materialForm.value.estado !== this.selectedMaterial!.estado;
          if (stateChanged) {
            this.materialService.cambiarEstado(this.selectedMaterial!.id, this.materialForm.value.estado).subscribe({
              next: () => {
                this.loadMateriales();
                this.toastService.success('Material de apoyo y su estado actualizados con éxito.');
                this.closeMaterialModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadMateriales();
            this.toastService.success('Material de apoyo actualizado con éxito.');
            this.closeMaterialModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else if (this.selectedFile) {
      this.materialService.subirMaterialConProgreso(this.moduloId, nombre, this.selectedFile).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.loadMateriales();
            this.toastService.success('Material de apoyo subido exitosamente.');
            this.closeMaterialModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  formatBytes = formatBytes;
  getFileIcon = getFileIcon;
  getCleanFileType = getCleanFileType;

  descargarMaterial(material: MaterialResponse): void {
    const extension = getFileExtension(material.tipoArchivo);
    const fileName = material.nombre.toLowerCase().endsWith(`.${extension}`) ? material.nombre : `${material.nombre}.${extension}`;

    this.archivoProtegidoService.descargar(material.archivoUrl, fileName).subscribe({
      error: (err) => {
        console.error('Error al descargar material:', err);
        this.toastService.error('No se pudo descargar el archivo.');
      }
    });
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.modalErrorMsg = err.error?.message || 'Error al procesar el material.';
    this.toastService.error(this.modalErrorMsg);
  }
}
