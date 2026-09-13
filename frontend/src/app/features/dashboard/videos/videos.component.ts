import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModuloService, AuthService } from '../../../core/services/';
import { VideoService } from '../../../core/services/';
import { ModuloResponse } from '../../../core/models/';
import { VideoRequest, VideoResponse } from '../../../core/models/';
import { ToastService } from '../../../core/services/';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { extraerIdYoutube } from '../../../core/utils/';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moduloService = inject(ModuloService);
  private videoService = inject(VideoService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  isDocente = false;

  moduloId!: number;
  modulo: ModuloResponse | null = null;
  videos: VideoResponse[] = [];
  filteredVideos: VideoResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;
  totalElements = 0;
  totalPagesCount = 1;

  // Modal controls
  showVideoModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingVideoAction: (() => void) | null = null;

  selectedVideo: VideoResponse | null = null;

  // Youtube Live Preview
  youtubeId = '';
  safeEmbedUrl: SafeResourceUrl | null = null;

  videoForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    youtubeUrl: ['', [Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.be)\\/.+$')]],
    orden: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
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
        this.loadVideos();
      },
      error: (err) => {
        console.error('Error al obtener modulo', err);
        this.router.navigate([this.isDocente ? '/dashboard/mis-cursos-docente' : '/dashboard/cursos']);
      }
    });
  }

  loadVideos(): void {
    this.videoService.listarVideosPorModulo(
      this.moduloId,
      this.currentPage - 1,
      this.pageSize,
      this.searchQuery,
      `fechaCreacion,${this.dateSortOrder}`
    ).subscribe({
      next: (data) => {
        this.videos = data.content ?? [];
        this.filteredVideos = this.videos;
        this.totalElements = data.totalElements ?? this.videos.length;
        this.totalPagesCount = data.totalPages ?? Math.max(1, Math.ceil(this.totalElements / this.pageSize));
        if (this.currentPage > this.totalPagesCount) {
          this.currentPage = this.totalPagesCount;
        }
      },
      error: (err) => {
        console.error('Error al listar videos', err);
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadVideos();
  }

  get totalPages(): number {
    return this.totalPagesCount;
  }

  get paginatedVideos(): VideoResponse[] {
    return this.filteredVideos;
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.currentPage = 1;
    this.loadVideos();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadVideos();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedVideo = null;
    this.youtubeId = '';
    this.safeEmbedUrl = null;
    this.videoForm.reset({
      titulo: '',
      descripcion: '',
      youtubeUrl: '',
      orden: this.videos.length + 1,
      estado: true
    });
    this.showVideoModal = true;
  }

  openEditModal(video: VideoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedVideo = video;
    
    this.videoForm.patchValue({
      titulo: video.titulo,
      descripcion: video.descripcion,
      youtubeUrl: video.youtubeUrl,
      orden: video.orden,
      estado: video.estado
    });

    this.onUrlInput();
    this.showVideoModal = true;
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    this.isFormSubmitting = false;
  }

  onUrlInput(): void {
    const url = this.videoForm.value.youtubeUrl || '';
    const id = this.extraerIdYoutube(url);
    if (id) {
      this.youtubeId = id;
      this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + id);
    } else {
      this.youtubeId = '';
      this.safeEmbedUrl = null;
    }
  }

  eliminarVideo(video: VideoResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Video?';
    this.confirmModalMessage = `¿Estás seguro de que deseas ELIMINAR permanentemente el video "${video.titulo}"? Esta acción no se puede deshacer y eliminará todo el progreso asociado.`;
    
    this.pendingVideoAction = () => {
      this.videoService.eliminarVideo(video.id).subscribe({
        next: () => {
          this.toastService.success('Video eliminado permanentemente.');
          this.loadVideos();
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el video.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  extraerIdYoutube = extraerIdYoutube;

  setEstado(estado: boolean): void {
    this.videoForm.patchValue({ estado });
  }

  get isEstadoActivo(): boolean {
    return this.videoForm.get('estado')?.value === true;
  }

  toggleEstado(video: VideoResponse): void {
    const nuevoEstado = !video.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'warning';
    this.confirmModalTitle = `¿${accion} Video?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} el video "${video.titulo}"?`;
    
    this.pendingVideoAction = () => {
      this.videoService.cambiarEstado(video.id, nuevoEstado).subscribe({
        next: () => {
          video.estado = nuevoEstado;
          this.toastService.success(`Video "${video.titulo}" ${nuevoEstado ? 'activado' : 'desactivado'} con éxito.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del video.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingVideoAction) {
      this.pendingVideoAction();
    }
  }

  onSubmit(): void {
    if (this.videoForm.invalid) {
      this.videoForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos del video correctamente.');
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: VideoRequest = {
      moduloId: this.moduloId,
      titulo: this.videoForm.value.titulo,
      descripcion: this.videoForm.value.descripcion,
      youtubeUrl: this.videoForm.value.youtubeUrl,
      orden: Number(this.videoForm.value.orden)
    };

    if (this.isEditMode && this.selectedVideo) {
      this.videoService.editarVideo(this.selectedVideo.id, req).subscribe({
        next: () => {
          const stateChanged = this.videoForm.value.estado !== this.selectedVideo!.estado;
          if (stateChanged) {
            this.videoService.cambiarEstado(this.selectedVideo!.id, this.videoForm.value.estado).subscribe({
              next: () => {
                this.loadVideos();
                this.toastService.success('Video y su estado actualizados con éxito.');
                this.closeVideoModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadVideos();
            this.toastService.success('Video modificado con éxito.');
            this.closeVideoModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.videoService.crearVideo(req).subscribe({
        next: () => {
          this.loadVideos();
          this.toastService.success('Video creado con éxito.');
          this.closeVideoModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Error al procesar el video.';
    this.toastService.error(this.modalErrorMsg);
  }
}
