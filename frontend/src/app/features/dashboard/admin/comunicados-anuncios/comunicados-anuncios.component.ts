import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { AnuncioModalService } from '../../../../core/services/anuncio-modal.service';
import { CursoService } from '../../../../core/services/curso.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ComunicadoRequest, NotificacionItem } from '../../../../core/models/notificacion.model';
import { AnuncioModalItem, AnuncioModalRequest } from '../../../../core/models/anuncio-modal.model';
import { CursoResponse } from '../../../../core/models/curso.model';
import { UserProfile } from '../../../../core/models';

@Component({
  selector: 'app-comunicados-anuncios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './comunicados-anuncios.component.html'
})
export class ComunicadosAnunciosComponent implements OnInit, OnDestroy {
  private notificacionService = inject(NotificacionService);
  private anuncioModalService = inject(AnuncioModalService);
  private cursoService = inject(CursoService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  currentUser: UserProfile | null = null;
  isAdmin = false;

  activeTab: 'bandeja' | 'comunicado' | 'anuncios' = 'bandeja';

  // Bandeja de Comunicados y Notificaciones
  notificaciones: NotificacionItem[] = [];
  totalNoLeidas = 0;
  totalFijados = 0;
  totalUrgentes = 0;
  cargandoBandeja = false;
  filtroBandeja: 'TODOS' | 'NO_LEIDOS' | 'FIJADOS' | 'URGENTES' = 'TODOS';
  searchQueryBandeja = '';
  expandedNotifId: number | null = null;
  
  // Paginación (10 items por página)
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.notificacionesFiltradas.length / this.pageSize) || 1;
  }

  get notificacionesPaginadas(): NotificacionItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.notificacionesFiltradas.slice(start, start + this.pageSize);
  }

  get pagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
    }
  }

  setFiltroBandeja(filtro: 'TODOS' | 'NO_LEIDOS' | 'FIJADOS' | 'URGENTES'): void {
    this.filtroBandeja = filtro;
    this.currentPage = 1;
  }

  toggleExpandNotificacion(id: number): void {
    this.expandedNotifId = this.expandedNotifId === id ? null : id;
  }

  // Emojis rápidos
  emojisDisponibles = ['🎉', '📢', '🎓', '⏰', '🌿', '💡', '🔥', '🏆', '💙', '🚀', '🌟', '✨', '📌', '⚠️'];

  // Rutas internas disponibles
  rutasInternas = [
    { ruta: '/cursos', label: '🎓 Catálogo General de Cursos' },
    { ruta: '/dashboard/mis-cursos', label: '📚 Mis Cursos (Panel Estudiante)' },
    { ruta: '/dashboard/mis-tareas', label: '📝 Mis Tareas y Evaluaciones' },
    { ruta: '/dashboard/certificados', label: '📜 Mis Certificados Obtenidos' },
    { ruta: '/validar-certificado', label: '🔍 Verificador Oficial de Certificados' },
    { ruta: '/dashboard/perfil', label: '👤 Perfil de Usuario' }
  ];

  // ==================== CONFIGURACIÓN DE PRIORIDADES ====================
  prioridadesConfig = [
    {
      id: 'INFO' as const,
      label: 'Informativo',
      emoji: '🔵',
      icon: 'info',
      desc: 'Avisos regulares, noticias y recordatorios generales.',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      activeBorder: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
    },
    {
      id: 'AVISO' as const,
      label: 'Importante',
      emoji: '🟡',
      icon: 'schedule',
      desc: 'Fechas de entrega, cierres de módulo y trámites.',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      activeBorder: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
    },
    {
      id: 'URGENTE' as const,
      label: 'Urgente',
      emoji: '🔴',
      icon: 'warning',
      desc: 'Atención inmediata, suspensión de clases o alertas críticas.',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      activeBorder: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
    },
    {
      id: 'PROMO' as const,
      label: 'Promocional',
      emoji: '🟢',
      icon: 'campaign',
      desc: 'Nuevos diplomados, talleres, promociones y eventos.',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      activeBorder: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
    }
  ];

  // ==================== FORMULARIO ANUNCIOS MODAL ====================
  anuncioForm: AnuncioModalRequest = {
    titulo: '',
    mensaje: '',
    imagenUrl: '',
    botonTexto: 'Me interesa',
    botonUrl: '',
    audiencia: 'TODOS',
    activo: true,
    fechaInicio: undefined,
    fechaFin: undefined
  };
  guardandoAnuncio = false;
  mensajeExitoAnuncio = '';
  mensajeErrorAnuncio = '';
  isDraggingAnuncio = false;

  // Asistente de Enlace para Anuncio
  linkTypeAnuncio: 'WHATSAPP' | 'CURSO' | 'INTERNO' | 'EXTERNO' = 'WHATSAPP';
  paises = [
    { codigo: '51', nombre: '🇵🇪 Perú (+51)' },
    { codigo: '52', nombre: '🇲🇽 México (+52)' },
    { codigo: '57', nombre: '🇨🇴 Colombia (+57)' },
    { codigo: '54', nombre: '🇦🇷 Argentina (+54)' },
    { codigo: '56', nombre: '🇨🇱 Chile (+56)' },
    { codigo: '593', nombre: '🇪🇨 Ecuador (+593)' },
    { codigo: '591', nombre: '🇧🇴 Bolivia (+591)' },
    { codigo: '34', nombre: '🇪🇸 España (+34)' },
    { codigo: '1', nombre: '🇺🇸 Estados Unidos (+1)' }
  ];

  codigoPaisAnuncio = '51';
  numeroLocalAnuncio = '987654321';
  whatsappMsgAnuncio = '¡Hola Plataforma LMS! Deseo más información sobre la promoción.';
  selectedCursoLinkAnuncio: number | null = null;
  selectedRutaInternaAnuncio = '/cursos';
  urlExternaAnuncio = '';

  // ==================== FORMULARIO COMUNICADOS ====================
  comunicado: ComunicadoRequest = {
    titulo: '',
    mensaje: '',
    urlDestino: '',
    icono: 'campaign',
    prioridad: 'PROMO',
    fijado: false,
    adjuntoUrl: '',
    adjuntoNombre: '',
    adjuntoTamano: '',
    audiencia: 'TODOS',
    cursoId: undefined
  };
  enviandoComunicado = false;
  mensajeExitoComunicado = '';
  mensajeErrorComunicado = '';
  prioridadComunicado: 'INFO' | 'PROMO' | 'AVISO' | 'URGENTE' = 'PROMO';
  isDraggingAdjunto = false;

  // Asistente de Enlace para Comunicado
  linkTypeComunicado: 'WHATSAPP' | 'CURSO' | 'INTERNO' | 'EXTERNO' | 'NINGUNO' = 'NINGUNO';
  codigoPaisComunicado = '51';
  numeroLocalComunicado = '987654321';
  whatsappMsgComunicado = '¡Hola Plataforma LMS! Tengo una consulta sobre el comunicado.';
  selectedCursoLinkComunicado: number | null = null;
  selectedRutaInternaComunicado = '/dashboard/mis-cursos';
  urlExternaComunicado = '';

  // Listado de Anuncios y Cursos
  anuncios: AnuncioModalItem[] = [];
  cursos: CursoResponse[] = [];
  cargandoAnuncios = false;

  private notifSub?: Subscription;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isAdmin = user?.rol === 'ADMINISTRADOR';
        if (this.isAdmin) {
          this.activeTab = 'comunicado';
          this.cargarCursos();
          this.cargarAnuncios();
        } else {
          this.activeTab = 'bandeja';
        }
      }
    });

    this.notifSub = this.notificacionService.resumen$.subscribe(resumen => {
      this.notificaciones = resumen.notificaciones;
      this.totalNoLeidas = resumen.totalNoLeidas;
      this.totalFijados = this.notificaciones.filter(n => n.fijado).length;
      this.totalUrgentes = this.notificaciones.filter(n => n.prioridad === 'URGENTE').length;
    });

    this.cargarBandeja();
    this.actualizarLinkAnuncio();
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  cargarBandeja(): void {
    this.cargandoBandeja = true;
    this.notificacionService.cargarNotificaciones(50).subscribe({
      next: () => {
        this.cargandoBandeja = false;
        this.totalFijados = this.notificaciones.filter(n => n.fijado).length;
        this.totalUrgentes = this.notificaciones.filter(n => n.prioridad === 'URGENTE').length;
      },
      error: () => this.cargandoBandeja = false
    });
  }

  get notificacionesFiltradas(): NotificacionItem[] {
    let list = this.notificaciones;

    if (this.filtroBandeja === 'NO_LEIDOS') {
      list = list.filter(n => !n.leido);
    } else if (this.filtroBandeja === 'FIJADOS') {
      list = list.filter(n => n.fijado);
    } else if (this.filtroBandeja === 'URGENTES') {
      list = list.filter(n => n.prioridad === 'URGENTE');
    }

    if (this.searchQueryBandeja.trim()) {
      const q = this.searchQueryBandeja.toLowerCase().trim();
      list = list.filter(n => 
        n.titulo.toLowerCase().includes(q) || 
        n.mensaje.toLowerCase().includes(q) ||
        (n.adjuntoNombre && n.adjuntoNombre.toLowerCase().includes(q))
      );
    }

    return list;
  }

  marcarComoLeida(item: NotificacionItem): void {
    if (!item.leido) {
      this.notificacionService.marcarComoLeida(item.id).subscribe();
    }
  }

  marcarTodasComoLeidas(): void {
    if (this.totalNoLeidas === 0) return;
    this.notificacionService.marcarTodasComoLeidas().subscribe();
  }

  abrirEnlace(item: NotificacionItem): void {
    this.marcarComoLeida(item);
    if (item.urlDestino && item.urlDestino.trim()) {
      if (item.urlDestino.startsWith('http://') || item.urlDestino.startsWith('https://') || item.urlDestino.startsWith('https://wa.me')) {
        window.open(item.urlDestino, '_blank');
      } else {
        this.router.navigateByUrl(item.urlDestino);
      }
    }
  }

  cargarCursos(): void {
    this.cursoService.listarCursos(0, 100).subscribe({
      next: (res) => {
        this.cursos = res.content || [];
        if (this.cursos.length > 0) {
          this.selectedCursoLinkAnuncio = this.cursos[0].id;
          this.selectedCursoLinkComunicado = this.cursos[0].id;
        }
      },
      error: (err) => console.error('Error cargando cursos:', err)
    });
  }

  cargarAnuncios(): void {
    this.cargandoAnuncios = true;
    this.anuncioModalService.listarTodos().subscribe({
      next: (data) => {
        this.anuncios = data;
        this.cargandoAnuncios = false;
      },
      error: () => this.cargandoAnuncios = false
    });
  }

  // ==================== ASISTENTE DE ENLACES ====================
  setLinkTypeAnuncio(type: 'WHATSAPP' | 'CURSO' | 'INTERNO' | 'EXTERNO'): void {
    this.linkTypeAnuncio = type;
    const sugerencias = this.getBotonSugerenciasAnuncio();
    if (sugerencias.length > 0) {
      this.anuncioForm.botonTexto = sugerencias[0];
    }
    this.actualizarLinkAnuncio();
  }

  setLinkTypeComunicado(type: 'WHATSAPP' | 'CURSO' | 'INTERNO' | 'EXTERNO' | 'NINGUNO'): void {
    this.linkTypeComunicado = type;
    this.actualizarLinkComunicado();
  }

  setBotonTextoAnuncio(texto: string): void {
    this.anuncioForm.botonTexto = texto;
  }

  getBotonSugerenciasAnuncio(): string[] {
    switch (this.linkTypeAnuncio) {
      case 'WHATSAPP':
        return ['Consultar por WhatsApp 💬', 'Inscribirme ahora 📲', 'Hablar con un asesor 👋', 'Pedir Información ℹ️'];
      case 'CURSO': {
        const curso = this.cursos.find(c => c.id === this.selectedCursoLinkAnuncio);
        const nameSnippet = curso ? curso.nombre.slice(0, 18) + '...' : 'Curso';
        return [`Ver ${nameSnippet} 🎓`, 'Ver Detalles del Curso 🎓', 'Comenzar a Aprender 🚀', 'Ver Temario Completo 📖'];
      }
      case 'INTERNO': {
        const ruta = this.rutasInternas.find(r => r.ruta === this.selectedRutaInternaAnuncio);
        const labelClean = ruta ? ruta.label.replace(/^[^\w]+/, '').trim() : 'Sección';
        return [`Ir a ${labelClean} ➔`, 'Abrir Sección 📚', 'Explorar Contenido 🌟'];
      }
      case 'EXTERNO':
        return ['Ingresar a la Sesión Zoom 🎥', 'Abrir Enlace Web 🌐', 'Acceder al Recurso 🔗', 'Ver Más Información ➔'];
      default:
        return [];
    }
  }

  getDestinoLegibleAnuncio(): string {
    switch (this.linkTypeAnuncio) {
      case 'WHATSAPP': {
        const pais = this.paises.find(p => p.codigo === this.codigoPaisAnuncio);
        const code = this.codigoPaisAnuncio || '51';
        const phone = this.numeroLocalAnuncio || '';
        return `Abrirá chat con WhatsApp: +${code} ${phone} ${pais ? '(' + pais.nombre + ')' : ''}`;
      }
      case 'CURSO': {
        const c = this.cursos.find(cur => cur.id === this.selectedCursoLinkAnuncio);
        return c ? `Página del curso: "${c.nombre}" (/cursos/${c.id})` : 'Página de catálogo de cursos';
      }
      case 'INTERNO': {
        const r = this.rutasInternas.find(rut => rut.ruta === this.selectedRutaInternaAnuncio);
        return r ? `Sección interna: ${r.label} (${r.ruta})` : 'Sección de la plataforma';
      }
      case 'EXTERNO':
        return this.urlExternaAnuncio ? `Enlace externo: ${this.urlExternaAnuncio}` : 'Enlace web externo';
      default:
        return 'Sin enlace configurado';
    }
  }

  getDestinoLegibleComunicado(): string {
    switch (this.linkTypeComunicado) {
      case 'NINGUNO':
        return 'Solo aviso informativo (sin redirección al hacer clic)';
      case 'WHATSAPP': {
        const pais = this.paises.find(p => p.codigo === this.codigoPaisComunicado);
        const code = this.codigoPaisComunicado || '51';
        const phone = this.numeroLocalComunicado || '';
        return `Chat con WhatsApp: +${code} ${phone} ${pais ? '(' + pais.nombre + ')' : ''}`;
      }
      case 'CURSO': {
        const c = this.cursos.find(cur => cur.id === this.selectedCursoLinkComunicado);
        return c ? `Página del curso: "${c.nombre}"` : 'Página de Curso';
      }
      case 'INTERNO': {
        const r = this.rutasInternas.find(rut => rut.ruta === this.selectedRutaInternaComunicado);
        return r ? `Sección interna: ${r.label}` : 'Sección interna';
      }
      case 'EXTERNO':
        return this.urlExternaComunicado ? `Enlace externo: ${this.urlExternaComunicado}` : 'Enlace web externo';
      default:
        return '';
    }
  }

  probarEnlace(url?: string): void {
    if (!url || url.trim() === '') {
      this.toastService.warning('Primero genera un enlace válido.');
      return;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      this.router.navigateByUrl(url);
    }
  }

  actualizarLinkAnuncio(): void {
    if (this.linkTypeAnuncio === 'WHATSAPP') {
      const cleanCode = (this.codigoPaisAnuncio || '51').replace(/[^0-9]/g, '');
      const cleanPhone = (this.numeroLocalAnuncio || '').replace(/[^0-9]/g, '');
      const fullPhone = `${cleanCode}${cleanPhone}`;
      const encodedMsg = encodeURIComponent(this.whatsappMsgAnuncio || 'Hola');
      this.anuncioForm.botonUrl = `https://wa.me/${fullPhone}?text=${encodedMsg}`;
    } else if (this.linkTypeAnuncio === 'CURSO') {
      this.anuncioForm.botonUrl = this.selectedCursoLinkAnuncio ? `/cursos/${this.selectedCursoLinkAnuncio}` : '/cursos';
    } else if (this.linkTypeAnuncio === 'INTERNO') {
      this.anuncioForm.botonUrl = this.selectedRutaInternaAnuncio;
    } else if (this.linkTypeAnuncio === 'EXTERNO') {
      this.anuncioForm.botonUrl = this.urlExternaAnuncio.trim();
    }
  }

  actualizarLinkComunicado(): void {
    if (this.linkTypeComunicado === 'NINGUNO') {
      this.comunicado.urlDestino = '';
    } else if (this.linkTypeComunicado === 'WHATSAPP') {
      const cleanCode = (this.codigoPaisComunicado || '51').replace(/[^0-9]/g, '');
      const cleanPhone = (this.numeroLocalComunicado || '').replace(/[^0-9]/g, '');
      const fullPhone = `${cleanCode}${cleanPhone}`;
      const encodedMsg = encodeURIComponent(this.whatsappMsgComunicado || 'Hola');
      this.comunicado.urlDestino = `https://wa.me/${fullPhone}?text=${encodedMsg}`;
    } else if (this.linkTypeComunicado === 'CURSO') {
      this.comunicado.urlDestino = this.selectedCursoLinkComunicado ? `/cursos/${this.selectedCursoLinkComunicado}` : '/cursos';
    } else if (this.linkTypeComunicado === 'INTERNO') {
      this.comunicado.urlDestino = this.selectedRutaInternaComunicado;
    } else if (this.linkTypeComunicado === 'EXTERNO') {
      this.comunicado.urlDestino = this.urlExternaComunicado.trim();
    }
  }

  // ==================== SUBIDA LOCAL DE IMÁGENES ====================
  onFileSelected(event: Event, target: 'anuncio' | 'comunicado'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivoImagen(input.files[0], target);
    }
  }

  onFileDropped(event: DragEvent, target: 'anuncio' | 'comunicado'): void {
    event.preventDefault();
    if (target === 'anuncio') this.isDraggingAnuncio = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.procesarArchivoImagen(event.dataTransfer.files[0], target);
    }
  }

  private procesarArchivoImagen(file: File, target: 'anuncio' | 'comunicado'): void {
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Debes seleccionar un archivo de imagen válido (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      this.toastService.error('La imagen no puede superar los 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      if (target === 'anuncio') {
        this.anuncioForm.imagenUrl = base64Url;
      }
      this.toastService.success('Imagen cargada correctamente');
    };
    reader.readAsDataURL(file);
  }

  removerImagen(target: 'anuncio' | 'comunicado'): void {
    if (target === 'anuncio') {
      this.anuncioForm.imagenUrl = '';
    }
  }

  // ==================== GESTIÓN DE DOCUMENTOS ADJUNTOS ====================
  onAdjuntoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivoAdjunto(input.files[0]);
    }
  }

  onAdjuntoDropped(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingAdjunto = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.procesarArchivoAdjunto(event.dataTransfer.files[0]);
    }
  }

  private procesarArchivoAdjunto(file: File): void {
    if (file.size > 15 * 1024 * 1024) {
      this.toastService.error('El documento adjunto no puede superar los 15MB');
      return;
    }

    const readableSize = this.formatearTamanoArchivo(file.size);
    this.comunicado.adjuntoNombre = file.name;
    this.comunicado.adjuntoTamano = readableSize;

    const reader = new FileReader();
    reader.onload = () => {
      this.comunicado.adjuntoUrl = reader.result as string;
      this.toastService.success(`Archivo "${file.name}" adjuntado (${readableSize})`);
    };
    reader.readAsDataURL(file);
  }

  removerAdjunto(): void {
    this.comunicado.adjuntoUrl = '';
    this.comunicado.adjuntoNombre = '';
    this.comunicado.adjuntoTamano = '';
  }

  formatearTamanoArchivo(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getIconoAdjunto(nombre?: string): string {
    if (!nombre) return 'description';
    const ext = nombre.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'article';
    if (['xls', 'xlsx'].includes(ext)) return 'table_view';
    if (['ppt', 'pptx'].includes(ext)) return 'slideshow';
    if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
    return 'description';
  }

  descargarAdjunto(item: { adjuntoUrl?: string; adjuntoNombre?: string }): void {
    if (!item.adjuntoUrl) {
      this.toastService.warning('No hay archivo disponible para descarga');
      return;
    }
    const a = document.createElement('a');
    a.href = item.adjuntoUrl;
    a.download = item.adjuntoNombre || 'documento_Plataforma LMS';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getPrioridadConfig(p?: string) {
    const defaultCfg = this.prioridadesConfig[0];
    if (!p) return defaultCfg;
    return this.prioridadesConfig.find(c => c.id === p.toUpperCase()) || defaultCfg;
  }

  // ==================== ESTADO DINÁMICO DE ANUNCIOS MODALES CON SCHEDULER ====================
  getEstadoAnuncio(item: AnuncioModalItem): { label: string; badgeClass: string; icon: string; dotClass: string } {
    if (!item.activo) {
      return {
        label: 'Pausado Manualmente',
        badgeClass: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        icon: 'pause_circle',
        dotClass: 'bg-slate-400'
      };
    }
    const now = new Date();
    if (item.fechaInicio && new Date(item.fechaInicio) > now) {
      return {
        label: 'Programado (En espera)',
        badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        icon: 'schedule',
        dotClass: 'bg-indigo-500'
      };
    }
    if (item.fechaFin && new Date(item.fechaFin) < now) {
      return {
        label: 'Caducado / Vencido',
        badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        icon: 'event_busy',
        dotClass: 'bg-rose-500'
      };
    }
    return {
      label: 'En Vivo (Activo)',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      icon: 'check_circle',
      dotClass: 'bg-emerald-500'
    };
  }

  // ==================== EMOJIS Y PLANTILLAS ====================
  insertarEmoji(emoji: string, campo: 'anuncio_titulo' | 'anuncio_mensaje' | 'comunicado_titulo' | 'comunicado_mensaje'): void {
    if (campo === 'anuncio_titulo') {
      this.anuncioForm.titulo = (this.anuncioForm.titulo || '') + ' ' + emoji;
    } else if (campo === 'anuncio_mensaje') {
      this.anuncioForm.mensaje = (this.anuncioForm.mensaje || '') + ' ' + emoji;
    } else if (campo === 'comunicado_titulo') {
      this.comunicado.titulo = (this.comunicado.titulo || '') + ' ' + emoji;
    } else if (campo === 'comunicado_mensaje') {
      this.comunicado.mensaje = (this.comunicado.mensaje || '') + ' ' + emoji;
    }
  }

  aplicarFormatoNegrita(campo: 'anuncio_mensaje' | 'comunicado_mensaje'): void {
    if (campo === 'anuncio_mensaje') {
      this.anuncioForm.mensaje = (this.anuncioForm.mensaje || '') + ' **texto en negrita** ';
    } else {
      this.comunicado.mensaje = (this.comunicado.mensaje || '') + ' **texto en negrita** ';
    }
  }

  aplicarPlantilla(tipo: 'seminario' | 'bienvenida' | 'recordatorio_tareas' | 'certificados', destino: 'anuncio' | 'comunicado'): void {
    if (tipo === 'seminario') {
      const titulo = '🌟 ¡Gran Seminario Internacional y Prácticas Clínicas! 🌟';
      const mensaje = 'Nos complace invitar a toda la comunidad académica a nuestro esperado **Seminario Intensivo**.\n\n🌿 Modalidad presencial y online en vivo.\n🎓 Certificación oficial incluida.\n⏰ Cupos limitados por orden de inscripción.';
      if (destino === 'anuncio') {
        this.anuncioForm.titulo = titulo;
        this.anuncioForm.mensaje = mensaje;
        this.anuncioForm.botonTexto = 'Inscribirme por WhatsApp 📲';
        this.linkTypeAnuncio = 'WHATSAPP';
        this.whatsappMsgAnuncio = 'Hola Plataforma LMS, deseo inscribirme al Seminario Internacional.';
        this.actualizarLinkAnuncio();
      } else {
        this.comunicado.titulo = titulo;
        this.comunicado.mensaje = mensaje;
        this.comunicado.icono = 'campaign';
        this.comunicado.prioridad = 'PROMO';
        this.prioridadComunicado = 'PROMO';
      }
    } else if (tipo === 'bienvenida') {
      const titulo = '🎓 ¡Bienvenidos al Nuevo Ciclo Académico Plataforma LMS! 🚀';
      const mensaje = 'Les damos la más cálida bienvenida a todos nuestros estudiantes y docentes.\n\n📚 Ya tienen habilitados sus módulos, materiales de lectura y grabaciones de clase en la plataforma.\n💡 Recuerden revisar periódicamente su panel de tareas y comunicados.';
      if (destino === 'anuncio') {
        this.anuncioForm.titulo = titulo;
        this.anuncioForm.mensaje = mensaje;
        this.anuncioForm.botonTexto = 'Ir a Mis Cursos 📚';
        this.linkTypeAnuncio = 'INTERNO';
        this.selectedRutaInternaAnuncio = '/dashboard/mis-cursos';
        this.actualizarLinkAnuncio();
      } else {
        this.comunicado.titulo = titulo;
        this.comunicado.mensaje = mensaje;
        this.comunicado.icono = 'school';
        this.comunicado.prioridad = 'INFO';
        this.prioridadComunicado = 'INFO';
      }
    } else if (tipo === 'recordatorio_tareas') {
      const titulo = '⏰ Recordatorio Importante: Entrega de Evaluaciones y Tareas 📝';
      const mensaje = 'Estimados estudiantes, recuerden que las fechas límite de entrega para los módulos en curso están próximas a vencer.\n\n📌 Suban sus archivos a tiempo para recibir la retroalimentación de sus docentes.\n✅ Pueden consultar el estado de sus entregas en la sección "Mis Tareas".';
      if (destino === 'anuncio') {
        this.anuncioForm.titulo = titulo;
        this.anuncioForm.mensaje = mensaje;
        this.anuncioForm.botonTexto = 'Ver Mis Tareas 📝';
        this.linkTypeAnuncio = 'INTERNO';
        this.selectedRutaInternaAnuncio = '/dashboard/mis-tareas';
        this.actualizarLinkAnuncio();
      } else {
        this.comunicado.titulo = titulo;
        this.comunicado.mensaje = mensaje;
        this.comunicado.icono = 'pending_actions';
        this.comunicado.prioridad = 'AVISO';
        this.prioridadComunicado = 'AVISO';
      }
    } else if (tipo === 'certificados') {
      const titulo = '🏆 ¡Nuevos Certificados y Diplomas Disponibles! ✨';
      const mensaje = 'Felicitaciones a los egresados de las últimas promociones. Sus certificados oficiales con código QR y validación institucional ya se encuentran listos para su descarga.';
      if (destino === 'anuncio') {
        this.anuncioForm.titulo = titulo;
        this.anuncioForm.mensaje = mensaje;
        this.anuncioForm.botonTexto = 'Descargar Certificados 📜';
        this.linkTypeAnuncio = 'INTERNO';
        this.selectedRutaInternaAnuncio = '/dashboard/certificados';
        this.actualizarLinkAnuncio();
      } else {
        this.comunicado.titulo = titulo;
        this.comunicado.mensaje = mensaje;
        this.comunicado.icono = 'verified';
        this.comunicado.prioridad = 'PROMO';
        this.prioridadComunicado = 'PROMO';
      }
    }
    this.toastService.info('Plantilla cargada. Puedes personalizarla libremente.');
  }

  setPrioridadComunicado(p: 'INFO' | 'PROMO' | 'AVISO' | 'URGENTE'): void {
    this.prioridadComunicado = p;
    this.comunicado.prioridad = p;
    if (p === 'INFO') this.comunicado.icono = 'info';
    if (p === 'PROMO') this.comunicado.icono = 'campaign';
    if (p === 'AVISO') this.comunicado.icono = 'schedule';
    if (p === 'URGENTE') this.comunicado.icono = 'warning';
  }

  getFormattedHtml(rawText?: string): SafeHtml {
    if (!rawText) return '';
    const formatted = rawText
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n/g, '<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  // ==================== ENVÍO Y GUARDADO ====================
  enviarComunicado(): void {
    if (!this.comunicado.titulo.trim() || !this.comunicado.mensaje.trim()) {
      this.mensajeErrorComunicado = 'Por favor completa el título y el mensaje del comunicado.';
      return;
    }

    if (this.comunicado.audiencia === 'POR_CURSO' && !this.comunicado.cursoId) {
      this.mensajeErrorComunicado = 'Debes seleccionar un curso específico para esta audiencia.';
      return;
    }

    this.actualizarLinkComunicado();
    this.comunicado.prioridad = this.prioridadComunicado;

    this.enviandoComunicado = true;
    this.mensajeExitoComunicado = '';
    this.mensajeErrorComunicado = '';

    this.notificacionService.enviarComunicado(this.comunicado).subscribe({
      next: () => {
        this.enviandoComunicado = false;
        this.mensajeExitoComunicado = '¡Comunicado enviado exitosamente a los destinatarios!';
        this.toastService.success('¡Comunicado emitido con éxito!');
        this.comunicado = {
          titulo: '',
          mensaje: '',
          urlDestino: '',
          icono: 'campaign',
          prioridad: 'PROMO',
          fijado: false,
          adjuntoUrl: '',
          adjuntoNombre: '',
          adjuntoTamano: '',
          audiencia: 'TODOS',
          cursoId: undefined
        };
        this.linkTypeComunicado = 'NINGUNO';
        this.cargarBandeja();
        setTimeout(() => this.mensajeExitoComunicado = '', 5000);
      },
      error: (err) => {
        this.enviandoComunicado = false;
        this.mensajeErrorComunicado = err.error?.message || 'Ocurrió un error al enviar el comunicado.';
      }
    });
  }

  guardarAnuncio(): void {
    if (!this.anuncioForm.titulo.trim()) {
      this.mensajeErrorAnuncio = 'El título del anuncio es obligatorio.';
      return;
    }

    this.actualizarLinkAnuncio();

    this.guardandoAnuncio = true;
    this.mensajeExitoAnuncio = '';
    this.mensajeErrorAnuncio = '';

    this.anuncioModalService.crear(this.anuncioForm).subscribe({
      next: () => {
        this.guardandoAnuncio = false;
        this.mensajeExitoAnuncio = '¡Campaña / Anuncio creado y activado correctamente!';
        this.toastService.success('¡Anuncio publicado en el dashboard!');
        this.anuncioForm = {
          titulo: '',
          mensaje: '',
          imagenUrl: '',
          botonTexto: 'Me interesa',
          botonUrl: '',
          audiencia: 'TODOS',
          activo: true,
          fechaInicio: undefined,
          fechaFin: undefined
        };
        this.cargarAnuncios();
        setTimeout(() => this.mensajeExitoAnuncio = '', 5000);
      },
      error: (err) => {
        this.guardandoAnuncio = false;
        this.mensajeErrorAnuncio = err.error?.message || 'Error al guardar el anuncio.';
      }
    });
  }

  toggleEstadoAnuncio(anuncio: AnuncioModalItem): void {
    const nuevoEstado = !anuncio.activo;
    this.anuncioModalService.cambiarEstado(anuncio.id, nuevoEstado).subscribe({
      next: () => {
        anuncio.activo = nuevoEstado;
        this.toastService.info(nuevoEstado ? 'Anuncio activado' : 'Anuncio pausado');
      },
      error: (err) => console.error('Error cambiando estado:', err)
    });
  }

  eliminarAnuncio(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este anuncio permanentemente?')) return;

    this.anuncioModalService.eliminar(id).subscribe({
      next: () => {
        this.anuncios = this.anuncios.filter(a => a.id !== id);
        this.toastService.success('Anuncio eliminado correctamente');
      },
      error: (err) => console.error('Error eliminando anuncio:', err)
    });
  }
}

