import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../core/services/academico.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  SesionClaseResponse,
  AsistenciaItemResponse,
  MarcacionResponse,
  PeriodoAcademico,
  SeccionGrado
} from '../../../core/models/academico.model';

@Component({
  selector: 'app-asistencia-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-qr.component.html',
  styleUrls: ['./asistencia-qr.component.css']
})
export class AsistenciaQrComponent implements OnInit, OnDestroy {
  private academicoService = inject(AcademicoService);
  private toast = inject(ToastService);

  @ViewChild('videoPreview') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('scannerCanvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Datos
  periodos: PeriodoAcademico[] = [];
  secciones: SeccionGrado[] = [];
  sesiones: SesionClaseResponse[] = [];
  asistencias: AsistenciaItemResponse[] = [];

  // Filtros y Selección
  seccionSeleccionadaId: number | null = null;
  sesionSeleccionadaId: number | null = null;
  filtroEstado: string = 'TODOS';
  busquedaEstudiante: string = '';

  // Escáner QR Cámara
  camaraActiva: boolean = false;
  stream: MediaStream | null = null;
  animFrameId: number | null = null;
  ultimoQrEscaneado: string = '';
  ultimoResultado: MarcacionResponse | null = null;

  // Formulario manual
  modalManualAbierto: boolean = false;
  tokenManualInput: string = '';
  estadoManual: string = 'PRESENTE';
  observacionManual: string = '';

  // Modal Nueva Sesión
  modalNuevaSesion: boolean = false;
  nuevaSesionTema: string = '';
  nuevaSesionHoraInicio: string = '08:00';
  nuevaSesionHoraFin: string = '09:30';

  cargando: boolean = false;

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  cargarDatosIniciales(): void {
    this.cargando = true;
    this.academicoService.listarPeriodos().subscribe({
      next: (res) => {
        this.periodos = res;
      }
    });

    this.academicoService.listarSecciones().subscribe({
      next: (res) => {
        this.secciones = res;
        if (res.length > 0) {
          this.seccionSeleccionadaId = res[0].id;
          this.cargarSesiones();
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cargarSesiones(): void {
    if (!this.seccionSeleccionadaId) return;
    this.cargando = true;
    // Mock curso id 1 o primer curso
    this.academicoService.listarSesiones(1, this.seccionSeleccionadaId).subscribe({
      next: (res) => {
        this.sesiones = res;
        if (res.length > 0) {
          this.sesionSeleccionadaId = res[0].id;
          this.cargarAsistencias();
        } else {
          this.sesionSeleccionadaId = null;
          this.asistencias = [];
        }
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  onCambioSeccion(): void {
    this.cargarSesiones();
  }

  onCambioSesion(): void {
    this.cargarAsistencias();
  }

  cargarAsistencias(): void {
    if (!this.sesionSeleccionadaId) {
      this.asistencias = [];
      return;
    }
    this.academicoService.listarAsistenciaSesion(this.sesionSeleccionadaId).subscribe({
      next: (res) => {
        this.asistencias = res;
      }
    });
  }

  // Cámara y Escáner QR
  async iniciarCamara(): Promise<void> {
    if (!this.sesionSeleccionadaId) {
      this.toast.error('Seleccione primero una sesión de clase activa.');
      return;
    }

    try {
      this.camaraActiva = true;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      setTimeout(() => {
        if (this.videoElement && this.videoElement.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
          this.videoElement.nativeElement.play();
          this.escanearFrame();
        }
      }, 300);
      this.toast.info('Cámara activada. Apunte al código QR del carnet del estudiante.');
    } catch (err) {
      this.camaraActiva = false;
      this.toast.error('No se pudo acceder a la cámara. Verifique los permisos en su navegador.');
    }
  }

  detenerCamara(): void {
    this.camaraActiva = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  escanearFrame(): void {
    if (!this.camaraActiva) return;

    // Simulación de escáner en bucle para captura de canvas
    this.animFrameId = requestAnimationFrame(() => this.escanearFrame());
  }

  // Simular o procesar lectura de token QR
  procesarTokenQr(token: string): void {
    if (!this.sesionSeleccionadaId) {
      this.toast.error('Seleccione una sesión antes de registrar.');
      return;
    }

    this.academicoService.marcarAsistenciaQr({
      qrToken: token,
      sesionId: this.sesionSeleccionadaId,
      metodo: 'QR_SCAN',
      estado: 'PRESENTE'
    }).subscribe({
      next: (res) => {
        this.ultimoResultado = res;
        this.toast.success(res.mensaje);
        this.reproducirSonidoExito();
        this.cargarAsistencias();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al validar el código QR.');
      }
    });
  }

  guardarMarcacionManual(): void {
    if (!this.tokenManualInput.trim()) {
      this.toast.error('Ingrese el código QR o DNI del estudiante.');
      return;
    }

    this.academicoService.marcarAsistenciaQr({
      qrToken: this.tokenManualInput.trim(),
      sesionId: this.sesionSeleccionadaId || undefined,
      metodo: 'MANUAL',
      estado: this.estadoManual,
      observaciones: this.observacionManual
    }).subscribe({
      next: (res) => {
        this.toast.success(res.mensaje);
        this.modalManualAbierto = false;
        this.tokenManualInput = '';
        this.observacionManual = '';
        this.cargarAsistencias();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'No se pudo registrar la asistencia.');
      }
    });
  }

  crearNuevaSesion(): void {
    if (!this.seccionSeleccionadaId) {
      this.toast.error('Seleccione una sección/grado primero.');
      return;
    }

    this.academicoService.crearSesion({
      cursoId: 1,
      seccionGradoId: this.seccionSeleccionadaId,
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: this.nuevaSesionHoraInicio,
      horaFin: this.nuevaSesionHoraFin,
      tema: this.nuevaSesionTema || 'Clase de Asistencia Regular'
    }).subscribe({
      next: (res) => {
        this.toast.success('Nueva sesión creada exitosamente.');
        this.modalNuevaSesion = false;
        this.nuevaSesionTema = '';
        this.cargarSesiones();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error al crear la sesión.');
      }
    });
  }

  cambiarEstadoDirecto(item: AsistenciaItemResponse, nuevoEstado: string): void {
    if (!this.sesionSeleccionadaId) return;

    this.academicoService.marcarAsistenciaQr({
      qrToken: item.codigoEstudiante,
      sesionId: this.sesionSeleccionadaId,
      metodo: 'MANUAL',
      estado: nuevoEstado,
      observaciones: 'Modificado por el docente en panel'
    }).subscribe({
      next: () => {
        item.estado = nuevoEstado;
        this.toast.success(`Estado actualizado a ${nuevoEstado}`);
      },
      error: () => {
        this.toast.error('No se pudo actualizar el estado.');
      }
    });
  }

  reproducirSonidoExito(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // La5
      osc.frequency.setValueAtTime(1760, audioCtx.currentTime + 0.1); // La6
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Ignorar si audio no está permitido por el navegador
    }
  }

  // Getters para estadísticas
  get totalAlumnos(): number {
    return this.asistencias.length;
  }

  get totalPresentes(): number {
    return this.asistencias.filter(a => a.estado === 'PRESENTE').length;
  }

  get totalTardanzas(): number {
    return this.asistencias.filter(a => a.estado === 'TARDANZA').length;
  }

  get totalFaltas(): number {
    return this.asistencias.filter(a => a.estado === 'FALTA' || a.estado === 'FALTA_INJUSTIFICADA').length;
  }

  get totalJustificadas(): number {
    return this.asistencias.filter(a => a.estado === 'FALTA_JUSTIFICADA').length;
  }

  get porcentajeAsistencia(): number {
    if (this.totalAlumnos === 0) return 0;
    const efectivos = this.totalPresentes + (this.totalTardanzas * 0.8) + (this.totalJustificadas * 0.5);
    return Math.round((efectivos / this.totalAlumnos) * 100);
  }

  get asistenciasFiltradas(): AsistenciaItemResponse[] {
    return this.asistencias.filter(a => {
      const matchEstado = this.filtroEstado === 'TODOS' || a.estado === this.filtroEstado;
      const matchSearch = !this.busquedaEstudiante.trim() ||
        a.estudianteNombres.toLowerCase().includes(this.busquedaEstudiante.toLowerCase()) ||
        a.estudianteApellidos.toLowerCase().includes(this.busquedaEstudiante.toLowerCase()) ||
        a.dni.includes(this.busquedaEstudiante) ||
        a.codigoEstudiante.toLowerCase().includes(this.busquedaEstudiante.toLowerCase());
      return matchEstado && matchSearch;
    });
  }
}
