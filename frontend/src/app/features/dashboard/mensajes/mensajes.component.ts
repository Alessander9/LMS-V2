import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MensajeriaService } from '../../../core/services/mensajeria.service';
import { AuthService } from '../../../core/services/auth.service';
import { CursoService } from '../../../core/services/curso.service';
import {
  ConversacionItem,
  MensajeItem,
  DestinatarioItem,
  BuzonResumen,
  CarpetaBuzon,
  MensajeRequest,
  RespuestaMensajeRequest
} from '../../../core/models/mensajeria.model';
import { UserProfile } from '../../../core/models/user-profile.model';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit, OnDestroy {
  private mensajeriaService = inject(MensajeriaService);
  private authService = inject(AuthService);
  private cursoService = inject(CursoService);
  private fb = inject(FormBuilder);

  currentUser: UserProfile | null = null;
  conversaciones: ConversacionItem[] = [];
  conversacionesFiltradas: ConversacionItem[] = [];
  selectedConversacion: ConversacionItem | null = null;
  destinatarios: DestinatarioItem[] = [];
  resumen: BuzonResumen = { totalNoLeidos: 0, totalRecibidos: 0, totalEnviados: 0, totalDestacados: 0 };

  // State
  isLoading = false;
  isLoadingThread = false;
  isSending = false;
  filtroActual: CarpetaBuzon = 'RECIBIDOS';
  busqueda = '';
  cursoFiltroId: number | null = null;
  cursosDisponibles: { id: number; titulo: string }[] = [];

  // Compose Modal
  modalRedactarOpen = false;
  nuevoMensajeForm!: FormGroup;
  adjuntoNuevoBase64: string | null = null;
  adjuntoNuevoNombre: string | null = null;
  adjuntoNuevoTipo: string | null = null;
  adjuntoNuevoTamano: string | null = null;

  // Reply Form
  respuestaTexto = '';
  respuestaPrioridad: 'NORMAL' | 'IMPORTANTE' | 'URGENTE' = 'NORMAL';
  adjuntoRespuestaBase64: string | null = null;
  adjuntoRespuestaNombre: string | null = null;
  adjuntoRespuestaTipo: string | null = null;
  adjuntoRespuestaTamano: string | null = null;

  // Voice Note Recording
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  isRecording = false;
  recordingTarget: 'NUEVO' | 'RESPUESTA' | null = null;
  recordingDurationSeconds = 0;
  recordingInterval: any = null;

  // Canned Responses (Plantillas Rápidas)
  plantillasRapidas: string[] = [
    '¡Hola! He recibido tu mensaje y revisaré tu consulta a la brevedad.',
    'Estimado(a), la información solicitada ha sido procesada correctamente.',
    'Por favor adjunta el avance o captura correspondiente para brindarte apoyo.',
    'Consulta resuelta con éxito. Quedo atento a cualquier duda adicional.',
    'Recuerda revisar las indicaciones y materiales disponibles en el aula virtual.'
  ];

  // Auto-draft keys
  private readonly DRAFT_NEW_KEY = 'Plataforma LMS_draft_new_message';

  private subs: Subscription = new Subscription();

  ngOnInit(): void {
    this.authService.getProfile().subscribe(user => {
      this.currentUser = user;
    });

    this.initForm();
    this.cargarResumen();
    this.cargarConversaciones();
    this.cargarDestinatarios();
    this.cargarCursos();
    this.cargarBorradorNuevo();

    // Subscribe to summary updates
    this.subs.add(
      this.mensajeriaService.resumen$.subscribe(r => {
        this.resumen = r;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.subs.unsubscribe();
  }

  initForm(): void {
    this.nuevoMensajeForm = this.fb.group({
      tipo: ['INDIVIDUAL', Validators.required],
      destinatarioId: [null, Validators.required],
      cursoId: [null],
      asunto: ['', [Validators.required, Validators.maxLength(200)]],
      contenido: ['', [Validators.required]],
      prioridad: ['NORMAL', Validators.required]
    });

    // Dynamic validator based on tipo
    this.nuevoMensajeForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const destControl = this.nuevoMensajeForm.get('destinatarioId');
      const cursoControl = this.nuevoMensajeForm.get('cursoId');

      if (tipo === 'INDIVIDUAL') {
        destControl?.setValidators([Validators.required]);
        cursoControl?.clearValidators();
        cursoControl?.setValue(null);
      } else if (tipo === 'CURSO_MASIVO') {
        destControl?.clearValidators();
        destControl?.setValue(null);
        cursoControl?.setValidators([Validators.required]);
      } else {
        destControl?.clearValidators();
        cursoControl?.clearValidators();
        destControl?.setValue(null);
        cursoControl?.setValue(null);
      }
      destControl?.updateValueAndValidity();
      cursoControl?.updateValueAndValidity();
    });

    // Auto-draft listener
    this.nuevoMensajeForm.valueChanges.subscribe(val => {
      if (this.modalRedactarOpen) {
        localStorage.setItem(this.DRAFT_NEW_KEY, JSON.stringify(val));
      }
    });
  }

  cargarCursos(): void {
    this.cursoService.listarCursos(0, 100).subscribe({
      next: (res) => {
        if (res && res.content && res.content.length > 0) {
          this.cursosDisponibles = res.content.map(c => ({ id: c.id, titulo: c.nombre }));
        } else {
          this.extraerCursosDisponibles();
        }
      },
      error: () => this.extraerCursosDisponibles()
    });
  }

  cargarResumen(): void {
    this.mensajeriaService.actualizarResumen().subscribe();
  }

  cargarConversaciones(selectFirst = false): void {
    this.isLoading = true;
    this.mensajeriaService.listarConversaciones(this.cursoFiltroId || undefined).subscribe({
      next: (data) => {
        this.conversaciones = data.content || [];
        this.extraerCursosDisponibles();
        this.aplicarFiltroLocal();
        this.isLoading = false;

        if (selectFirst && this.conversacionesFiltradas.length > 0) {
          this.seleccionarConversacion(this.conversacionesFiltradas[0]);
        } else if (this.selectedConversacion) {
          const updated = this.conversaciones.find(c => c.id === this.selectedConversacion!.id);
          if (updated) {
            this.seleccionarConversacion(updated);
          }
        }
      },
      error: (err) => {
        console.error('Error cargando conversaciones:', err);
        this.isLoading = false;
      }
    });
  }

  cargarDestinatarios(): void {
    this.mensajeriaService.obtenerDestinatarios().subscribe({
      next: (data) => {
        this.destinatarios = data;
      },
      error: (err) => console.error('Error cargando destinatarios:', err)
    });
  }

  extraerCursosDisponibles(): void {
    const map = new Map<number, string>();
    this.conversaciones.forEach(c => {
      if (c.cursoId && c.cursoNombre) {
        map.set(c.cursoId, c.cursoNombre);
      }
    });
    this.cursosDisponibles = Array.from(map.entries()).map(([id, titulo]) => ({ id, titulo }));
  }

  cambiarFiltro(filtro: CarpetaBuzon): void {
    this.filtroActual = filtro;
    this.aplicarFiltroLocal();
  }

  onCursoFilterChange(): void {
    this.cargarConversaciones();
  }

  aplicarFiltroLocal(): void {
    let list = [...this.conversaciones];

    // Filter by Carpeta
    if (this.filtroActual === 'RECIBIDOS') {
      list = list.filter(c => !c.soyEmisor || !!c.tieneMensajesRecibidos);
    } else if (this.filtroActual === 'ENVIADOS') {
      list = list.filter(c => !!c.soyEmisor || !!c.tieneMensajesEnviados);
    } else if (this.filtroActual === 'NO_LEIDOS') {
      list = list.filter(c => (c.noLeidosCount || 0) > 0);
    } else if (this.filtroActual === 'DESTACADOS') {
      list = list.filter(c => !!c.tieneDestacados || c.mensajes?.some(m => m.destacado) || c.tipo === 'DESTACADO');
    }

    if (!this.busqueda.trim()) {
      this.conversacionesFiltradas = list;
      return;
    }
    const q = this.busqueda.toLowerCase();
    this.conversacionesFiltradas = list.filter(c =>
      c.asunto.toLowerCase().includes(q) ||
      c.ultimoMensaje?.toLowerCase().includes(q) ||
      c.contactoNombre?.toLowerCase().includes(q) ||
      (c.cursoNombre && c.cursoNombre.toLowerCase().includes(q))
    );
  }

  seleccionarConversacion(c: ConversacionItem): void {
    this.isLoadingThread = true;
    this.mensajeriaService.obtenerConversacion(c.id).subscribe({
      next: (full) => {
        this.selectedConversacion = full;
        this.isLoadingThread = false;
        this.cargarBorradorRespuesta(full.id);
        this.scrollToBottom();

        if (full.noLeidosCount > 0) {
          this.mensajeriaService.marcarConversacionComoLeida(full.id).subscribe(() => {
            full.noLeidosCount = 0;
            const item = this.conversaciones.find(x => x.id === full.id);
            if (item) item.noLeidosCount = 0;
            this.cargarResumen();
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar hilo:', err);
        this.isLoadingThread = false;
      }
    });
  }

  toggleDestacado(msg: MensajeItem, event: Event): void {
    event.stopPropagation();
    this.mensajeriaService.toggleDestacado(msg.id).subscribe({
      next: () => {
        msg.destacado = !msg.destacado;
        if (this.selectedConversacion) {
          const hasFav = this.selectedConversacion.mensajes?.some(m => m.destacado);
          this.selectedConversacion.tieneDestacados = hasFav;
          const convItem = this.conversaciones.find(c => c.id === this.selectedConversacion!.id);
          if (convItem) {
            convItem.tieneDestacados = hasFav;
          }
        }
        this.cargarResumen();
      }
    });
  }

  // ================= REDACTAR NUEVO =================
  abrirModalRedactar(): void {
    this.modalRedactarOpen = true;
    this.cargarBorradorNuevo();
  }

  cerrarModalRedactar(): void {
    this.modalRedactarOpen = false;
    this.cancelarGrabacion();
  }

  enviarNuevoMensaje(): void {
    if (this.nuevoMensajeForm.invalid) {
      this.nuevoMensajeForm.markAllAsTouched();
      return;
    }

    this.isSending = true;
    const formVal = this.nuevoMensajeForm.value;

    const req: MensajeRequest = {
      tipo: formVal.tipo,
      destinatarioId: formVal.destinatarioId ? Number(formVal.destinatarioId) : undefined,
      cursoId: formVal.cursoId ? Number(formVal.cursoId) : undefined,
      asunto: formVal.asunto,
      contenido: formVal.contenido,
      prioridad: formVal.prioridad,
      adjuntoUrl: this.adjuntoNuevoBase64 || undefined,
      adjuntoNombre: this.adjuntoNuevoNombre || undefined,
      adjuntoTamano: this.adjuntoNuevoTamano || undefined
    };

    this.mensajeriaService.enviarMensaje(req).subscribe({
      next: () => {
        this.isSending = false;
        this.modalRedactarOpen = false;
        this.limpiarBorradorNuevo();
        this.cargarResumen();
        this.filtroActual = 'ENVIADOS';
        this.cargarConversaciones(true);
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.isSending = false;
        alert(err.error?.message || 'Ocurrió un error al enviar el mensaje.');
      }
    });
  }

  // ================= RESPONDER A HILO =================
  insertarPlantilla(texto: string): void {
    this.respuestaTexto = this.respuestaTexto ? `${this.respuestaTexto}\n${texto}` : texto;
    this.guardarBorradorRespuesta();
  }

  enviarRespuesta(): void {
    if (!this.selectedConversacion || (!this.respuestaTexto.trim() && !this.adjuntoRespuestaBase64)) {
      return;
    }

    this.isSending = true;
    const req: RespuestaMensajeRequest = {
      contenido: this.respuestaTexto.trim() || '(Archivo / Nota de voz adjunta)',
      adjuntoUrl: this.adjuntoRespuestaBase64 || undefined,
      adjuntoNombre: this.adjuntoRespuestaNombre || undefined,
      adjuntoTamano: this.adjuntoRespuestaTamano || undefined
    };

    this.mensajeriaService.responderMensaje(this.selectedConversacion.id, req).subscribe({
      next: (nuevoMensaje) => {
        this.isSending = false;
        if (this.selectedConversacion) {
          if (!this.selectedConversacion.mensajes) {
            this.selectedConversacion.mensajes = [];
          }
          this.selectedConversacion.mensajes.push(nuevoMensaje);
          this.selectedConversacion.totalMensajes = (this.selectedConversacion.totalMensajes || 0) + 1;
          this.selectedConversacion.ultimoMensaje = nuevoMensaje.contenido;
          this.selectedConversacion.fechaUltimoMensaje = nuevoMensaje.fechaEnvio;
        }

        this.limpiarBorradorRespuesta(this.selectedConversacion!.id);
        this.respuestaTexto = '';
        this.adjuntoRespuestaBase64 = null;
        this.adjuntoRespuestaNombre = null;
        this.adjuntoRespuestaTipo = null;
        this.adjuntoRespuestaTamano = null;
        this.scrollToBottom();
        this.cargarResumen();
      },
      error: (err) => {
        console.error('Error enviando respuesta:', err);
        this.isSending = false;
        alert(err.error?.message || 'Error al responder mensaje.');
      }
    });
  }

  // ================= ADJUNTOS =================
  onFileSelected(event: any, target: 'NUEVO' | 'RESPUESTA'): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo supera el límite máximo permitido (15MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const tamanoStr = this.formatearTamano(file.size);
      if (target === 'NUEVO') {
        this.adjuntoNuevoBase64 = base64;
        this.adjuntoNuevoNombre = file.name;
        this.adjuntoNuevoTipo = file.type || 'application/octet-stream';
        this.adjuntoNuevoTamano = tamanoStr;
        if (!this.nuevoMensajeForm.get('contenido')?.value) {
          this.nuevoMensajeForm.patchValue({ contenido: `Archivo adjunto: ${file.name}` });
        }
      } else {
        this.adjuntoRespuestaBase64 = base64;
        this.adjuntoRespuestaNombre = file.name;
        this.adjuntoRespuestaTipo = file.type || 'application/octet-stream';
        this.adjuntoRespuestaTamano = tamanoStr;
      }
    };
    reader.readAsDataURL(file);
  }

  eliminarAdjunto(target: 'NUEVO' | 'RESPUESTA'): void {
    if (target === 'NUEVO') {
      this.adjuntoNuevoBase64 = null;
      this.adjuntoNuevoNombre = null;
      this.adjuntoNuevoTipo = null;
      this.adjuntoNuevoTamano = null;
    } else {
      this.adjuntoRespuestaBase64 = null;
      this.adjuntoRespuestaNombre = null;
      this.adjuntoRespuestaTipo = null;
      this.adjuntoRespuestaTamano = null;
    }
  }

  // ================= NOTAS DE VOZ (AUDIO RECORDER) =================
  async iniciarGrabacion(target: 'NUEVO' | 'RESPUESTA'): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordingTarget = target;
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const audioFileName = `Nota_de_voz_${timestamp}.webm`;
          const tamanoStr = this.formatearTamano(audioBlob.size);

          if (this.recordingTarget === 'NUEVO') {
            this.adjuntoNuevoBase64 = base64;
            this.adjuntoNuevoNombre = audioFileName;
            this.adjuntoNuevoTipo = 'audio/webm';
            this.adjuntoNuevoTamano = tamanoStr;
            if (!this.nuevoMensajeForm.get('contenido')?.value) {
              this.nuevoMensajeForm.patchValue({ contenido: 'Nota de voz adjunta' });
            }
          } else {
            this.adjuntoRespuestaBase64 = base64;
            this.adjuntoRespuestaNombre = audioFileName;
            this.adjuntoRespuestaTipo = 'audio/webm';
            this.adjuntoRespuestaTamano = tamanoStr;
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingDurationSeconds = 0;
      this.recordingInterval = setInterval(() => {
        this.recordingDurationSeconds++;
      }, 1000);
    } catch (err) {
      console.error('Error accediendo al micrófono:', err);
      alert('No se pudo acceder al micrófono para grabar la nota de voz.');
    }
  }

  detenerGrabacion(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.stopRecordingTimer();
    }
  }

  cancelarGrabacion(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.audioChunks = [];
      this.stopRecordingTimer();
    }
  }

  private stopRecordingTimer(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    this.recordingDurationSeconds = 0;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // ================= BORRADORES (AUTO-DRAFT) =================
  private cargarBorradorNuevo(): void {
    const saved = localStorage.getItem(this.DRAFT_NEW_KEY);
    if (saved) {
      try {
        const val = JSON.parse(saved);
        this.nuevoMensajeForm.patchValue(val, { emitEvent: false });
      } catch (e) {
        localStorage.removeItem(this.DRAFT_NEW_KEY);
      }
    }
  }

  private limpiarBorradorNuevo(): void {
    localStorage.removeItem(this.DRAFT_NEW_KEY);
    this.nuevoMensajeForm.reset({
      tipo: 'INDIVIDUAL',
      prioridad: 'NORMAL'
    });
    this.eliminarAdjunto('NUEVO');
  }

  guardarBorradorRespuesta(): void {
    if (this.selectedConversacion) {
      localStorage.setItem(`Plataforma LMS_draft_reply_${this.selectedConversacion.id}`, this.respuestaTexto);
    }
  }

  private cargarBorradorRespuesta(convId: number): void {
    const saved = localStorage.getItem(`Plataforma LMS_draft_reply_${convId}`);
    this.respuestaTexto = saved || '';
  }

  private limpiarBorradorRespuesta(convId: number): void {
    localStorage.removeItem(`Plataforma LMS_draft_reply_${convId}`);
  }

  // ================= EXPORTAR / IMPRIMIR =================
  imprimirConversacion(): void {
    window.print();
  }

  // ================= HELPERS =================
  esMio(msg: MensajeItem): boolean {
    return !!this.currentUser && (msg.remitenteId === this.currentUser.id || msg.esMio);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('threadChatContainer');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 150);
  }

  formatearTamano(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getIconForFile(tipo?: string | null, nombre?: string | null): string {
    if (tipo?.startsWith('audio/') || nombre?.endsWith('.webm') || nombre?.endsWith('.mp3')) return 'mic';
    if (tipo?.startsWith('image/')) return 'image';
    if (tipo?.includes('pdf') || nombre?.endsWith('.pdf')) return 'picture_as_pdf';
    if (tipo?.includes('word') || nombre?.endsWith('.docx') || nombre?.endsWith('.doc')) return 'description';
    return 'attach_file';
  }

  isAudio(tipo?: string | null, nombre?: string | null): boolean {
    return (tipo?.startsWith('audio/') || nombre?.endsWith('.webm') || nombre?.endsWith('.mp3')) ?? false;
  }
}
