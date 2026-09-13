import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ChatbotService, ChatMessage } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css']
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy {
  private chatbotService = inject(ChatbotService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  isPublicRoute = true;
  isOpen = false;
  isFabMenuOpen = false;
  isLoading = false;
  userMessage = '';
  messages: ChatMessage[] = [];
  lastConsultedCourse = '';

  /** Offset en px para compensar el teclado virtual en iOS (visualViewport) */
  keyboardOffset = 0;

  defaultSuggestions = [
    '📚 ¿Qué cursos tienen?',
    '💲 Precios y Planes',
    '📍 Horarios y Sedes',
    '📝 ¿Cómo me inscribo?'
  ];

  // Cursos presenciales con emoji, nombre y ruta
  cursosPresenciales = [
    { emoji: '☯️', name: 'Acupuntura China (12 meses)', route: '/cursos/acupuntura-presencial' },
    { emoji: '☯️', name: 'Acupuntura China (7 meses)', route: '/cursos/acupuntura-china-7-meses' },
    { emoji: '👂', name: 'Auriculoterapia', route: '/cursos/auriculoterapia-presencial' },
    { emoji: '💆', name: 'Digitopresión Mecánica', route: '/cursos/digitopresion-presencial' },
    { emoji: '🍏', name: 'Dietética', route: '/cursos/dietetica-presencial' },
    { emoji: '🌿', name: 'Fitoterapia', route: '/cursos/fitoterapia-presencial' },
    { emoji: '👣', name: 'Reflexología Podal (Full Day)', route: '/cursos-presenciales' },
    { emoji: '🧘', name: 'Stretching Terapéutico (Full Day)', route: '/cursos-presenciales' },
    { emoji: '🔥', name: 'Moxibustión y Ventosaterapia', route: '/cursos-presenciales' },
    { emoji: '🩹', name: 'Parálisis Facial (Full Day)', route: '/cursos-presenciales' },
  ];

  // Cursos virtuales con emoji, nombre y ruta
  cursosVirtuales = [
    { emoji: '☯️', name: 'Acupuntura China', route: '/cursos/acupuntura-china' },
    { emoji: '👂', name: 'Auriculoterapia', route: '/cursos/auriculoterapia' },
    { emoji: '💆', name: 'Masaje Terapéutico', route: '/cursos/masaje-terapeutico' },
    { emoji: '👣', name: 'Seminario Reflexología (En vivo)', route: '/cursos/seminario-reflexologia-online' },
    { emoji: '👣', name: 'Reflexología Podal', route: '/cursos/reflexologia-online' },
    { emoji: '💆‍♀️', name: 'Acupuntura Estética', route: '/cursos/acupuntura-estetica-online' },
    { emoji: '🧘', name: 'Stretching Terapéutico', route: '/cursos/stretching-terapeutico-online' },
    { emoji: '🩹', name: 'Parálisis Facial', route: '/cursos/paralisis-facial-acupuntura-fisioterapia-online' },
    { emoji: '🍏', name: 'Control de Peso', route: '/cursos/control-peso-auriculoterapia-acupuntura-online' },
  ];

  // Estado de visualización de botones de cursos: 'none' | 'category' | 'presencial' | 'virtual'
  courseButtonsMode: 'none' | 'category' | 'presencial' | 'virtual' = 'none';

  // Getter para saber si se muestran botones de cursos (usado en el template)
  get showCourseButtons(): boolean {
    return this.courseButtonsMode !== 'none';
  }

  suggestions: string[] = [...this.defaultSuggestions];

  ngOnInit(): void {
    this.checkRoute();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkRoute();
    });

    this.loadChatHistory();
    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.onDocumentClick);
    }
    // Escuchar el teclado virtual en iOS Safari vía visualViewport
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.onVisualViewportResize);
      window.visualViewport.addEventListener('scroll', this.onVisualViewportResize);
    }
  }

  private checkRoute(): void {
    if (typeof window === 'undefined') return;
    const url = (this.router.url || window.location.pathname).toLowerCase();
    const isHidden = url.startsWith('/login') || 
                     url.startsWith('/dashboard') || 
                     url.startsWith('/admin') ||
                     url.includes('/login') ||
                     url.includes('/dashboard');
    this.isPublicRoute = !isHidden;
    if (!this.isPublicRoute) {
      this.isOpen = false;
      this.isFabMenuOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick);
    }
    // Limpiar listener del teclado virtual
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.onVisualViewportResize);
      window.visualViewport.removeEventListener('scroll', this.onVisualViewportResize);
    }
  }

  toggleFabMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isFabMenuOpen = !this.isFabMenuOpen;
  }

  closeFabMenu(): void {
    this.isFabMenuOpen = false;
  }

  openAssistant(): void {
    this.isFabMenuOpen = false;
    this.isOpen = true;
    this.scrollToBottom();
  }

  /**
   * Obtiene el nombre del curso basado en la URL actual de la página
   */
  getCurrentCourseName(): string | null {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.toLowerCase();

    if (path.includes('auriculoterapia-presencial')) return 'la Formación de Auriculoterapia Presencial';
    if (path.includes('auriculoterapia')) return 'el Curso de Auriculoterapia Online';
    if (path.includes('acupuntura-china-7-meses')) return 'la Formación de Acupuntura China (7 meses)';
    if (path.includes('acupuntura-presencial')) return 'la Formación de Acupuntura China Presencial';
    if (path.includes('acupuntura-estetica')) return 'el Curso de Acupuntura Estética Online';
    if (path.includes('acupuntura-china') || path.includes('acupuntura')) return 'el Curso de Acupuntura China';
    if (path.includes('digitopresion-presencial') || path.includes('digitopresion')) return 'la Formación de Masaje Terapéutico y Digitopresión Mecánica Presencial';
    if (path.includes('masaje-terapeutico') || path.includes('masaje')) return 'el Curso de Masaje Terapéutico Online';
    if (path.includes('aromaterapia-flores-bach')) return 'el Curso de Aromaterapia y Flores de Bach';
    if (path.includes('dietetica-presencial') || path.includes('dietetica')) return 'el Curso de Dietética y Nutrición Holística Presencial';
    if (path.includes('fitoterapia-presencial') || path.includes('fitoterapia')) return 'el Curso de Fitoterapia y Plantas Medicinales Presencial';
    if (path.includes('seminario-reflexologia')) return 'el Seminario de Reflexología Podal Online';
    if (path.includes('reflexologia-online') || path.includes('reflexologia')) return 'el Curso de Reflexología Podal';
    if (path.includes('stretching-terapeutico')) return 'el Curso de Stretching Terapéutico';
    if (path.includes('paralisis-facial')) return 'el Curso de Parálisis Facial';
    if (path.includes('control-peso')) return 'el Curso de Control de Peso y Auriculoterapia';
    if (path.includes('cursos-presenciales')) return 'los Cursos Presenciales';
    if (path.includes('cursos-online')) return 'los Cursos Online';
    if (path.includes('sedes')) return 'las Sedes y Horarios de Plataforma LMS';
    if (path.includes('certificacion')) return 'la Certificación Internacional';
    if (path.includes('bolsa-de-trabajo') || path.includes('bolsa-trabajo')) return 'la Bolsa de Trabajo';

    return null;
  }

  /**
   * Genera el enlace oficial de WhatsApp personalizado según el curso actual
   */
  getWhatsAppUrl(specificCourse?: string): string {
    const course = specificCourse || this.lastConsultedCourse || this.getCurrentCourseName();
    let message = 'Hola Plataforma LMS, quiero información sobre cómo inscribirme.';
    if (course) {
      if (course.startsWith('el ') || course.startsWith('la ') || course.startsWith('los ') || course.startsWith('las ')) {
        message = `Hola Plataforma LMS, quiero información sobre cómo inscribirme en ${course}`;
      } else {
        message = `Hola Plataforma LMS, quiero información sobre cómo inscribirme en el curso de ${course}`;
      }
    }
    const encoded = encodeURIComponent(message);
    return `https://wa.me/51939371250?text=${encoded}`;
  }

  openWhatsApp(): void {
    this.isFabMenuOpen = false;
    if (typeof window !== 'undefined') {
      const waUrl = this.getWhatsAppUrl();
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }

  private onDocumentClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (this.isFabMenuOpen && !target.closest('.chatbot-fab-container')) {
      this.closeFabMenu();
    }
  };

  /**
   * Ajusta el tamaño de la ventana de chat cuando el teclado virtual
   * aparece o desaparece en iOS Safari (visualViewport API).
   */
  private onVisualViewportResize = (): void => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const isMobile = window.innerWidth <= 480;
    if (!isMobile || !this.isOpen) {
      this.keyboardOffset = 0;
      return;
    }
    // La diferencia entre el alto de la ventana y el visualViewport es el teclado
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    this.keyboardOffset = Math.max(0, keyboardHeight);
  };

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isFabMenuOpen = false;
      this.scrollToBottom();
    }
  }

  loadChatHistory(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const historyJson = sessionStorage.getItem('Plataforma LMS-chatbot-history');
      if (historyJson) {
        try {
          this.messages = JSON.parse(historyJson);
        } catch (e) {
          this.messages = [];
        }
      }
    }

    if (this.messages.length === 0) {
      this.messages.push({
        role: 'assistant',
        content: '👋 ¡Hola! Soy el asistente virtual de **Plataforma LMS** 🌿.\n\n¿En qué te puedo ayudar hoy? Elige una opción o escribe tu consulta:'
      });
      this.saveChatHistory();
    }

    // Analizar el historial para setear las sugerencias dinámicas correspondientes
    if (this.messages.length > 1) {
      const lastMsg = this.messages[this.messages.length - 1];
      const prevMsg = this.messages[this.messages.length - 2];
      if (lastMsg.role === 'assistant' && prevMsg.role === 'user') {
        this.updateDynamicSuggestions(prevMsg.content, lastMsg.content);
      }
    } else if (this.messages.length === 1) {
      const lastMsg = this.messages[this.messages.length - 1];
      if (lastMsg.role === 'assistant') {
        this.updateDynamicSuggestions('', lastMsg.content);
      }
    }
  }

  saveChatHistory(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('Plataforma LMS-chatbot-history', JSON.stringify(this.messages));
    }
  }

  clearHistory(): void {
    this.messages = [];
    this.suggestions = [...this.defaultSuggestions];
    this.loadChatHistory();
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) return;

    const textToSend = this.userMessage.trim();
    this.userMessage = '';

    // Agregar mensaje del usuario a la lista
    this.messages.push({
      role: 'user',
      content: textToSend
    });
    this.saveChatHistory();
    this.scrollToBottom();

    this.isLoading = true;

    // Determinar cuál es la intención del mensaje del usuario
    const lowerQuery = textToSend.toLowerCase();

    // 1. Identificar el último curso consultado
    if (lowerQuery.includes('auriculo')) {
      this.lastConsultedCourse = 'Auriculoterapia';
    } else if (lowerQuery.includes('acupuntura')) {
      if (lowerQuery.includes('7 meses') || lowerQuery.includes('7meses')) {
        this.lastConsultedCourse = 'Acupuntura China (7 meses)';
      } else {
        this.lastConsultedCourse = 'Acupuntura China Anual';
      }
    } else if (lowerQuery.includes('digitopres')) {
      this.lastConsultedCourse = 'Digitopresión Mecánica';
    } else if (lowerQuery.includes('masaje')) {
      this.lastConsultedCourse = 'Masaje Terapéutico';
    }

    // 2. Interceptar consultas de inscripción/matrícula (Dirección a WhatsApp de Admisión)
    const isEnrollmentQuery = 
      lowerQuery.includes('inscribir') || 
      lowerQuery.includes('inscripcion') || 
      lowerQuery.includes('matricular') || 
      lowerQuery.includes('matricula') ||
      lowerQuery.includes('quiero entrar') ||
      lowerQuery.includes('comprar curso');

    if (isEnrollmentQuery) {
      const waUrl = this.getWhatsAppUrl(this.lastConsultedCourse || this.getCurrentCourseName() || undefined);

      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `📝 **Inscripciones y Matrículas** 🌿\n\n¡Excelente decisión! El proceso de inscripción se realiza de manera personalizada a través de nuestro canal oficial de WhatsApp de Admisiones.\n\nHaz clic en el botón de abajo para comunicarte con un asesor de admisiones y procesar tu matrícula de forma inmediata:\n\n[button:💬 Iniciar Inscripción por WhatsApp](${waUrl})`
        });
        this.isLoading = false;
        this.suggestions = ['🏠 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Saludo simple: responder sin IA (solo si es un saludo puro y no pregunta por algo específico)
    if (
      (lowerQuery.includes('hola') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) &&
      !lowerQuery.includes('auriculo') &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('masaje') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('stretching') &&
      !lowerQuery.includes('paralisis') &&
      !lowerQuery.includes('dietetica') &&
      !lowerQuery.includes('fitoterapia') &&
      !lowerQuery.includes('digitopresion') &&
      !lowerQuery.includes('curso') &&
      !lowerQuery.includes('taller') &&
      !lowerQuery.includes('programa') &&
      !lowerQuery.includes('precio') &&
      !lowerQuery.includes('costo') &&
      !lowerQuery.includes('pago') &&
      !lowerQuery.includes('contacto') &&
      !lowerQuery.includes('direccion') &&
      !lowerQuery.includes('ubicacion')
    ) {
      this.messages.push({
        role: 'assistant',
        content: `👋 ¡Hola! Con gusto te oriento en nuestros programas académicos.\n\n[button:🏫 Ver Cursos Presenciales](/cursos-presenciales)\n[button:💻 Ver Cursos Online](/cursos-online)\n[button:💬 Hablar por WhatsApp](${this.getWhatsAppUrl()})`
      });
      this.isLoading = false;
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    // Manejo de cursos presenciales específicamente
    if (
      (lowerQuery.includes('presencial') || lowerQuery.includes('presenciales')) &&
      !lowerQuery.includes('auriculo') &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('masaje') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('stretching') &&
      !lowerQuery.includes('paralisis') &&
      !lowerQuery.includes('dietetica') &&
      !lowerQuery.includes('fitoterapia') &&
      !lowerQuery.includes('digitopresion') &&
      !lowerQuery.includes('aromaterapia')
    ) {
      this.courseButtonsMode = 'none';
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `🏫 **Cursos Presenciales en Plataforma LMS (Sede Lima - Lince)**\n\nClases prácticas con pacientes reales los domingos:\n\n• 🎓 **Diplomados**: Acupuntura China (12 y 7 meses)\n• 🌿 **Cursos Cortos (1-2 meses)**: Auriculoterapia, Digitopresión, Fitoterapia, Dietética, Aromaterapia\n• 🔥 **Talleres Full Day**: Moxibustión, Reflexología, Stretching, Parálisis Facial\n\n[button:🔗 Ver Catálogo Presencial Completo](/cursos-presenciales)\n[button:💬 Consultar con Admisiones](${this.getWhatsAppUrl('los Cursos Presenciales')})`
        });
        this.suggestions = [
          '👂 Auriculoterapia Presencial',
          '☯️ Acupuntura China',
          '💆 Digitopresión Presencial',
          '🌸 Aromaterapia Presencial',
          '🔥 Talleres Full Day',
          '🔄 Volver al Inicio'
        ];
        this.isLoading = false;
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Manejo de cursos virtuales específicamente
    if (
      (lowerQuery.includes('virtual') || lowerQuery.includes('virtuales') || lowerQuery.includes('online')) &&
      !lowerQuery.includes('auriculo') &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('masaje') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('stretching') &&
      !lowerQuery.includes('paralisis') &&
      !lowerQuery.includes('dietetica') &&
      !lowerQuery.includes('fitoterapia') &&
      !lowerQuery.includes('digitopresion') &&
      !lowerQuery.includes('aromaterapia')
    ) {
      this.courseButtonsMode = 'none';
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `💻 **Cursos Online en Plataforma LMS (Campus Virtual)**\n\nClases en vivo y acceso 24/7 con certificación oficial:\n\n• 🎓 **Diplomados**: Acupuntura China Online (12 y 7 meses)\n• 🌿 **Cursos Especializados**: Auriculoterapia, Masaje Terapéutico, Aromaterapia\n• 👣 **Seminarios en vivo**: Reflexología Podal, Acupuntura Estética, Parálisis Facial\n\n[button:🔗 Ver Catálogo Online Completo](/cursos-online)\n[button:💬 Consultar con Admisiones](${this.getWhatsAppUrl('los Cursos Online')})`
        });
        this.suggestions = [
          '👂 Auriculoterapia Online',
          '☯️ Acupuntura Online',
          '💆‍♂️ Masaje Terapéutico Online',
          '🌸 Aromaterapia Online',
          '👣 Seminario de Reflexología',
          '🔄 Volver al Inicio'
        ];
        this.isLoading = false;
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Manejo genérico de consulta de cursos: mostrar categorías
    if (
      (lowerQuery.includes('cursos') ||
       lowerQuery.includes('curso') ||
       lowerQuery.includes('taller') ||
       lowerQuery.includes('programa') ||
       lowerQuery.includes('qué cursos') ||
       lowerQuery.includes('que cursos') ||
       lowerQuery.includes('ver cursos') ||
       lowerQuery.includes('tienen cursos')) &&
      !lowerQuery.includes('auriculo') &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('masaje') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('stretching') &&
      !lowerQuery.includes('paralisis') &&
      !lowerQuery.includes('dietetica') &&
      !lowerQuery.includes('fitoterapia') &&
      !lowerQuery.includes('digitopresion')
    ) {
      this.courseButtonsMode = 'category';
      this.suggestions = [];
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '📚 Contamos con formaciones en dos modalidades. Elige la que prefieras:\n\n[button:🏫 Cursos Presenciales](/cursos-presenciales)\n[button:💻 Cursos Online](/cursos-online)'
        });
        this.isLoading = false;
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    // Detección de intención: Hablar con un Asesor Humano
    if (
      lowerQuery.includes('humano') ||
      lowerQuery.includes('persona') ||
      lowerQuery.includes('asesor') ||
      lowerQuery.includes('asesora') ||
      lowerQuery.includes('hablar con alguien') ||
      lowerQuery.includes('llamar')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '👋 **Atención Personalizada con un Asesor** 🌿\n\nTe conecto directamente con nuestro equipo de Admisiones para una atención 1 a 1 inmediata:\n\n[button:💬 Hablar con un Asesor Humano](https://wa.me/51939371250?text=Hola%20Plataforma LMS%2C%20solicito%20atenci%C3%B3n%20con%20un%20asesor%20humano)\n[button:📍 Ver Sedes y Horarios](/sedes)'
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Detección de intención: Inicios de clases, Fechas y Vacantes
    if (
      lowerQuery.includes('inicio') ||
      lowerQuery.includes('inician') ||
      lowerQuery.includes('inicia') ||
      lowerQuery.includes('fecha') ||
      lowerQuery.includes('vacante') ||
      lowerQuery.includes('cuando empieza') ||
      lowerQuery.includes('cuándo empieza') ||
      lowerQuery.includes('cuando inicia') ||
      lowerQuery.includes('cuándo inicia')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '🗓️ **Inicios de Clases y Vacantes Disponibles**\n\n• **Presencial (Sede Lince)**: Inicios regulares los domingos en turnos mañana y tarde.\n• **Campus Virtual**: Acceso inmediato 24/7 al confirmar tu matrícula.\n\n[button:💬 Consultar Vacantes Disponibles por WhatsApp](' + this.getWhatsAppUrl('las Vacantes e Inicios de Clases') + ')\n[button:🏫 Ver Cursos Presenciales](/cursos-presenciales)'
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Detección de intención: Promociones / Facilidades de pago
    if (
      lowerQuery.includes('descuento') ||
      lowerQuery.includes('promocion') ||
      lowerQuery.includes('promoción') ||
      lowerQuery.includes('rebaja') ||
      lowerQuery.includes('oferta') ||
      lowerQuery.includes('beca')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '🌿 **Tarifas Oficiales y Facilidades de Pago**\n\nOfrecemos cuotas mensuales fraccionadas y accesibles de acuerdo al programa académico de tu interés.\n\n[button:💬 Consultar Facilidades de Pago](' + this.getWhatsAppUrl('las Tarifas y Facilidades de Pago') + ')\n[button:🏫 Ver Cursos Presenciales](/cursos-presenciales)'
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    else if (
      (lowerQuery.includes('pago') ||
       lowerQuery.includes('pagar') ||
       lowerQuery.includes('precio') ||
       lowerQuery.includes('costo') ||
       lowerQuery.includes('mensualidad') ||
       lowerQuery.includes('yape') ||
       lowerQuery.includes('plin') ||
       lowerQuery.includes('banco') ||
       lowerQuery.includes('transferencia') ||
       lowerQuery.includes('requisitos') ||
       lowerQuery.includes('inscripcion') ||
       lowerQuery.includes('inscribir') ||
       lowerQuery.includes('matricular')) &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('auriculo')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `💳 **Inscripciones y Pagos**\n\n• **Métodos**: Yape, Plin, transferencias bancarias (BCP, BBVA, Interbank) y efectivo en sede.\n• **Requisitos**: DNI y comprobante de pago.\n\n[button:💬 Iniciar Inscripción por WhatsApp](${this.getWhatsAppUrl()})`
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (
      lowerQuery.includes('contacto') ||
      lowerQuery.includes('telefono') ||
      lowerQuery.includes('whatsapp') ||
      lowerQuery.includes('correo') ||
      lowerQuery.includes('email') ||
      lowerQuery.includes('redes') ||
      lowerQuery.includes('sociales')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `📞 **Canales de Atención Oficial** 🌿\n\n• **WhatsApp Central**: +51 939 371 250\n• **Sede Lince**: Av. Julio C. Tello 438\n\n[button:💬 Hablar por WhatsApp](https://wa.me/51939371250?text=Hola%20Plataforma LMS%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n)\n[button:📍 Ver Sedes y Horarios](/sedes)`
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (lowerQuery.includes('huanuco') || lowerQuery.includes('huánuco')) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '🌿 **Sede Huánuco - Coordinación Oficial**\n\nPrácticas clínicas presenciales y eventos intensivos.\n\n[button:💬 Contactar vía WhatsApp](https://wa.me/51935354183?text=Hola%20Plataforma LMS%2C%20deseo%20contactar%20con%20la%20Coordinaci%C3%B3n%20de%20la%20Sede%20Hu%C3%A1nuco%20para%20m%C3%A1s%20informaci%C3%B3n)\n[button:📍 Conocer Nuestras Sedes](/sedes)'
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (
      lowerQuery.includes('ubicacion') ||
      lowerQuery.includes('direccion') ||
      lowerQuery.includes('donde queda') ||
      lowerQuery.includes('donde estan') ||
      lowerQuery.includes('sedes') ||
      lowerQuery.includes('lince') ||
      lowerQuery.includes('piura') ||
      lowerQuery.includes('mapa')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `📍 **Sedes de Plataforma LMS** 🏫\n\n• **Lima**: Av. Julio C. Tello 438, Lince.\n• **Huánuco**: Prácticas clínicas y talleres.\n\n[button:🗺️ Conocer Nuestras Sedes](/sedes)\n[button:💬 Consultar por WhatsApp](${this.getWhatsAppUrl('las Sedes de Plataforma LMS')})`
        });
        this.isLoading = false;
        this.suggestions = ['🕒 Horarios de Atención', '🏫 Cursos Presenciales', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (
      (lowerQuery.includes('horario') ||
       lowerQuery.includes('atencion') ||
       lowerQuery.includes('hora') ||
       lowerQuery.includes('clases')) &&
      !lowerQuery.includes('acupuntura') &&
      !lowerQuery.includes('reflexolog') &&
      !lowerQuery.includes('auriculo')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: '🕒 **Horarios de Clases** 🗓️\n\n• **Campus Online**: Acceso libre 24/7.\n• **Presencial Lince**: Domingos 10:00 AM - 1:00 PM y 3:00 PM - 6:00 PM.\n\n[button:🏫 Ver Cursos Presenciales](/cursos-presenciales)\n[button:💻 Ver Cursos Online](/cursos-online)'
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (
      lowerQuery.includes('certificado') ||
      lowerQuery.includes('certificacion') ||
      lowerQuery.includes('validez') ||
      lowerQuery.includes('aval') ||
      lowerQuery.includes('avalado') ||
      lowerQuery.includes('qr')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `🎖️ **Certificación Oficial** 🎓\n\n• Diplomas con **código QR de validación en tiempo real**.\n• Avalado por terapeutas colegiados y validez nacional.\n\n[button:🔍 Validar Certificado](/certificacion)\n[button:💬 Consultar por WhatsApp](${this.getWhatsAppUrl('la Certificación')})`
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }
    else if (
      lowerQuery.includes('plan') ||
      lowerQuery.includes('planes') ||
      lowerQuery.includes('suscripcion') ||
      lowerQuery.includes('suscripciones') ||
      lowerQuery.includes('basico') ||
      lowerQuery.includes('intermedio') ||
      lowerQuery.includes('premium')
    ) {
      setTimeout(() => {
        this.messages.push({
          role: 'assistant',
          content: `💻 **Planes del Campus Virtual**\n\n• **Básico**: Videoclases libres.\n• **Intermedio**: Clases + manuales PDF y exámenes.\n• **Premium**: Todo incluido + certificado oficial y soporte docente VIP.\n\n[button:🚀 Ver Catálogo Online](/cursos-online)\n[button:💬 Iniciar Inscripción](${this.getWhatsAppUrl('los Planes del Campus Virtual')})`
        });
        this.isLoading = false;
        this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
        this.saveChatHistory();
        this.scrollToBottom();
      }, 250);
      return;
    }

    // Obtener historial conversacional libre de system prompt
    const history = this.messages.slice(0, -1);

    this.chatbotService.sendMessage(textToSend, history).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'assistant',
          content: res.response
        });
        this.isLoading = false;
        this.updateDynamicSuggestions(textToSend, res.response);
        this.saveChatHistory();
        this.scrollToBottom();
      },
      error: () => {
        this.messages.push({
          role: 'assistant',
          content: 'Lo siento, experimenté un problema al conectar con el servidor de inteligencia artificial. Puedes escribir directamente a nuestro WhatsApp oficial: [+51 939 371 250](https://wa.me/51939371250) para obtener ayuda inmediata.'
        });
        this.isLoading = false;
        this.saveChatHistory();
        this.scrollToBottom();
      }
    });
  }

  selectSuggestion(suggestion: string): void {
    if (suggestion.includes('Volver al Inicio') || suggestion === 'Volver al Inicio') {
      this.suggestions = [...this.defaultSuggestions];
      this.courseButtonsMode = 'none';
      return;
    }

    if (suggestion.includes('Ver más cursos') || suggestion.includes('ver más cursos')) {
      this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
      this.messages.push({
        role: 'assistant',
        content: '¿Qué modalidad te gustaría explorar?'
      });
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    if (suggestion.includes('Cursos Presenciales') || suggestion === '🏫 Cursos Presenciales' || suggestion === '🏫🏢 Cursos Presenciales') {
      this.courseButtonsMode = 'none';
      this.suggestions = [
        '👂 Auriculoterapia Presencial',
        '☯️ Acupuntura China',
        '💆 Digitopresión Presencial',
        '🌸 Aromaterapia Presencial',
        '🔥 Talleres Full Day',
        '🔄 Volver al Inicio'
      ];
      this.messages.push({
        role: 'assistant',
        content: `🏫 **Cursos Presenciales en Plataforma LMS (Sede Lima - Lince)**\n\nClases prácticas y supervisión clínica con pacientes los domingos:\n\n• 🎓 **Diplomados**: Acupuntura China (12 y 7 meses)\n• 🌿 **Cursos Cortos**: Auriculoterapia, Digitopresión, Fitoterapia, Dietética, Aromaterapia\n• 🔥 **Talleres Full Day**: Moxibustión, Reflexología, Stretching, Parálisis Facial\n\n[button:🔗 Ver Catálogo Presencial Completo](/cursos-presenciales)\n[button:💬 Consultar con Admisiones](${this.getWhatsAppUrl('los Cursos Presenciales')})`
      });
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    if (suggestion.includes('Cursos Online') || suggestion.includes('Cursos Virtuales') || suggestion === '💻 Cursos Online' || suggestion === '💻🖥️ Cursos Virtuales') {
      this.courseButtonsMode = 'none';
      this.suggestions = [
        '👂 Auriculoterapia Online',
        '☯️ Acupuntura Online',
        '💆‍♂️ Masaje Terapéutico Online',
        '🌸 Aromaterapia Online',
        '👣 Seminario de Reflexología',
        '🔄 Volver al Inicio'
      ];
      this.messages.push({
        role: 'assistant',
        content: `💻 **Cursos Online en Plataforma LMS (Campus Virtual)**\n\nClases en vivo y acceso 24/7 con certificación oficial:\n\n• 🎓 **Diplomados**: Acupuntura China Online (12 y 7 meses)\n• 🌿 **Cursos Especializados**: Auriculoterapia, Masaje Terapéutico, Aromaterapia\n• 👣 **Seminarios en vivo**: Reflexología Podal, Acupuntura Estética, Parálisis Facial\n\n[button:🔗 Ver Catálogo Online Completo](/cursos-online)\n[button:💬 Consultar con Admisiones](${this.getWhatsAppUrl('los Cursos Online')})`
      });
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    if (suggestion.includes('Acupuntura China') && !suggestion.includes('12') && !suggestion.includes('7') && !suggestion.includes('Online')) {
      this.suggestions = [
        '☯️ Acupuntura 12 Meses Presencial',
        '☯️ Acupuntura 7 Meses Presencial',
        '☯️ Acupuntura Online',
        '🏫 Cursos Presenciales',
        '🔄 Volver al Inicio'
      ];
      this.messages.push({
        role: 'assistant',
        content: `☯️ **Diplomado de Acupuntura China**\n\nFormación clínica profesional avalada. ¿Qué modalidad y duración prefieres?\n\n• **12 Meses (Anual)**: S/ 270/mes (Práctica clínica completa).\n• **7 Meses (Intensivo)**: S/ 150/mes (Fines de semana).\n\n[button:📥 Descargar Temario 12 Meses (PDF)](/assets/temarios/temario-acupuntura-12-meses.pdf)\n[button:📥 Descargar Temario 7 Meses (PDF)](/assets/temarios/temario-acupuntura-7-meses.pdf)\n[button:💬 Inscribirme por WhatsApp](${this.getWhatsAppUrl('el Diplomado de Acupuntura China')})`
      });
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    if (suggestion.includes('Talleres Full Day') || suggestion.includes('Talleres Presenciales')) {
      this.suggestions = [
        '🔥 Moxibustión y Ventosas',
        '👣 Reflexología Full Day',
        '🧘 Stretching Terapéutico',
        '🏫 Cursos Presenciales',
        '🔄 Volver al Inicio'
      ];
      this.messages.push({
        role: 'assistant',
        content: `🔥 **Talleres Intensivos Presenciales (Full Day)**\n\nJornadas prácticas 100% aplicadas de 10:00 AM a 4:00 PM en Sede Lince:\n\n• **Moxibustión y Ventosaterapia**: S/ 130\n• **Reflexología Podal Intensiva**: S/ 130\n• **Stretching Terapéutico**: S/ 130\n• **Acupuntura en Parálisis Facial**: S/ 180\n\n[button:💬 Inscribirme a un Taller por WhatsApp](${this.getWhatsAppUrl('los Talleres Presenciales Full Day')})\n[button:🏫 Ver Cursos Presenciales](/cursos-presenciales)`
      });
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    const lowerSugg = suggestion.toLowerCase();

    if (lowerSugg.includes('aromaterapia') && (lowerSugg.includes('presencial') || !lowerSugg.includes('online'))) {
      this.showCourseResponse(
        '🌸 Aromaterapia y Flores de Bach Presencial',
        '/cursos/aromaterapia-flores-bach',
        ''
      );
      return;
    }
    if (lowerSugg.includes('aromaterapia') && lowerSugg.includes('online')) {
      this.showCourseResponse(
        '🌸 Aromaterapia y Flores de Bach Online',
        '/cursos/aromaterapia-flores-bach',
        ''
      );
      return;
    }

    // Detecciones específicas de clics de sugerencias para dar botones web + PDF directamente
    if (lowerSugg.includes('auriculo') && lowerSugg.includes('presencial')) {
      this.showCourseResponse(
        '👂 Auriculoterapia Presencial',
        '/cursos/auriculoterapia-presencial',
        '/assets/temarios/temario-auriculoterapia.pdf'
      );
      return;
    }
    if (lowerSugg.includes('auriculo') && (lowerSugg.includes('online') || lowerSugg.includes('virtual'))) {
      this.showCourseResponse(
        '👂 Auriculoterapia Online',
        '/cursos/auriculoterapia',
        '/assets/temarios/temario-auriculoterapia.pdf'
      );
      return;
    }
    if (lowerSugg.includes('acupuntura') && lowerSugg.includes('anual') && lowerSugg.includes('presencial')) {
      this.showCourseResponse(
        '☯️ Acupuntura China Anual Presencial',
        '/cursos/acupuntura-presencial',
        '/assets/temarios/temario-acupuntura-12-meses.pdf'
      );
      return;
    }
    if (lowerSugg.includes('acupuntura') && lowerSugg.includes('anual') && (lowerSugg.includes('online') || lowerSugg.includes('virtual'))) {
      this.showCourseResponse(
        '☯️ Acupuntura China Anual Online',
        '/cursos/acupuntura-china',
        '/assets/temarios/temario-acupuntura-12-meses.pdf'
      );
      return;
    }
    if (lowerSugg.includes('acupuntura') && lowerSugg.includes('7') && lowerSugg.includes('presencial')) {
      this.showCourseResponse(
        '☯️ Acupuntura China 7 Meses Presencial',
        '/cursos/acupuntura-china-7-meses',
        '/assets/temarios/temario-acupuntura-7-meses.pdf'
      );
      return;
    }
    if (lowerSugg.includes('acupuntura') && lowerSugg.includes('7') && (lowerSugg.includes('online') || lowerSugg.includes('virtual'))) {
      this.showCourseResponse(
        '☯️ Acupuntura China 7 Meses Online',
        'https://wa.me/51939371250',
        '/assets/temarios/temario-acupuntura-7-meses.pdf'
      );
      return;
    }
    if (lowerSugg.includes('digitopres') && lowerSugg.includes('presencial')) {
      this.showCourseResponse(
        '💆 Digitopresión Mecánica Presencial',
        '/cursos/digitopresion-presencial',
        '/assets/temarios/temario-digitopresion.pdf'
      );
      return;
    }
    if (lowerSugg.includes('digitopres') && (lowerSugg.includes('online') || lowerSugg.includes('virtual'))) {
      this.showCourseResponse(
        '💆 Digitopresión Mecánica Online',
        'https://wa.me/51939371250',
        '/assets/temarios/temario-digitopresion.pdf'
      );
      return;
    }
    if (lowerSugg.includes('masaje') && (lowerSugg.includes('online') || lowerSugg.includes('virtual'))) {
      this.showCourseResponse(
        '💆‍♂️ Masaje Terapéutico Online',
        '/cursos/masaje-terapeutico',
        ''
      );
      return;
    }

    // Si estamos mostrando categorías (presencial/virtual), manejar la selección
    if (this.courseButtonsMode === 'category') {
      if (suggestion.includes('Presenciales')) {
        this.courseButtonsMode = 'presencial';
        this.messages.push({
          role: 'assistant',
          content: '🏫 **Cursos Presenciales disponibles en Plataforma LMS**\n\nSelecciona un curso para ver más detalles:'
        });
      } else if (suggestion.includes('Virtuales')) {
        this.courseButtonsMode = 'virtual';
        this.messages.push({
          role: 'assistant',
          content: '💻 **Cursos Virtuales disponibles en Plataforma LMS**\n\nSelecciona un curso para ver más detalles:'
        });
      }
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    // Si estamos mostrando cursos individuales de la lista estática (presencial o virtual)
    if (this.courseButtonsMode === 'presencial' || this.courseButtonsMode === 'virtual') {
      const lista = this.courseButtonsMode === 'presencial' ? this.cursosPresenciales : this.cursosVirtuales;
      const isVirtualMode = this.courseButtonsMode === 'virtual';
      const curso = lista.find(c => suggestion.includes(c.name));
      this.courseButtonsMode = 'none';
      this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '💲 Precios y Planes', '🔄 Volver al Inicio'];
      if (curso) {
        let pdfUrl = '';
        let lowerName = curso.name.toLowerCase();
        if (lowerName.includes('auriculo')) {
          pdfUrl = 'https://drive.google.com/file/d/1rfCAOoLOw2mrnHjVEnOU01Xp-ZjO9Aca/view?usp=drive_link';
        } else if (lowerName.includes('12 meses') || (isVirtualMode && lowerName === 'acupuntura china')) {
          pdfUrl = 'https://drive.google.com/file/d/1jW-uQ_Y3N7Aw4Dor0tKGpdAYqJZzznty/view?usp=drive_link';
        } else if (lowerName.includes('7 meses')) {
          pdfUrl = 'https://drive.google.com/file/d/1jd8qVcZ-Q2ekZA-51g63Gk652kQPpQWK/view?usp=drive_link';
        } else if (lowerName.includes('digitopres')) {
          pdfUrl = 'https://drive.google.com/file/d/1ENJZf4r0ZUtxbIQBilZiTd9jCgzokQt4/view?usp=drive_link';
        }

        let content = `${curso.emoji} **${curso.name}**\n\nPrograma oficial con certificación y práctica clínica:\n\n[button:🔗 Ver Detalles del Curso](${curso.route})\n`;
        if (pdfUrl) {
          content += `[button:📥 Descargar Temario (PDF)](${pdfUrl})\n`;
        }
        content += `[button:💬 Inscribirme por WhatsApp](${this.getWhatsAppUrl(curso.name)})`;
        
        this.messages.push({
          role: 'assistant',
          content: content
        });
      } else {
        this.messages.push({
          role: 'assistant',
          content: `📚 No encontré ese curso. Puedes explorar nuestro catálogo completo aquí:\n\n[button:🔗 Ver Todos los Cursos](/cursos)`
        });
      }
      this.saveChatHistory();
      this.scrollToBottom();
      return;
    }

    let sanitizedMsg = suggestion;
    if (suggestion.includes('Más Presenciales')) {
      sanitizedMsg = 'Cursos Presenciales';
    } else if (suggestion.includes('Más Virtuales')) {
      sanitizedMsg = 'Cursos Virtuales';
    } else {
      // Quitar el emoji al enviar el mensaje de texto para no entorpecer el RAG de la IA
      sanitizedMsg = suggestion.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
    }
    this.userMessage = sanitizedMsg;
    this.sendMessage();
  }

  showCourseResponse(courseName: string, webRoute: string, pdfUrl: string): void {
    let content = `🎓 **${courseName}**\n\nPrograma oficial con certificación y práctica clínica:\n\n[button:🔗 Ver Detalles del Curso](${webRoute})\n`;
    if (pdfUrl) {
      content += `[button:📥 Descargar Temario (PDF)](${pdfUrl})\n`;
    }
    content += `[button:💬 Inscribirme por WhatsApp](${this.getWhatsAppUrl(courseName)})`;
    this.messages.push({
      role: 'assistant',
      content: content
    });
    this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
    this.saveChatHistory();
    this.scrollToBottom();
  }

  formatMessage(text: string): string {
    if (!text) return '';

    // Escapar etiquetas HTML básicas para prevenir XSS
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convertir **negrita** a <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Limpiar backticks o bloques de código alrededor de botones o enlaces
    html = html.replace(/`\[button:\s*(.*?)\]\((.*?)\)`/g, '[button:$1]($2)');
    html = html.replace(/`\[(.*?)\]\((.*?)\)`/g, '[$1]($2)');

    // Reemplazo inteligente de enlaces tipo botón [button:texto](url) o enlaces markdown [texto](url)
    html = html.replace(/\[(?:button:\s*)?(.*?)\]\((.*?)\)/g, (match, label: string, url: string) => {
      const lowerLabel = label.toLowerCase();
      const lowerUrl = url.toLowerCase();

      const isWhatsApp = lowerUrl.includes('wa.me') || lowerLabel.includes('whatsapp') || lowerLabel.includes('inscribir') || lowerLabel.includes('matricular');
      const isTemario = lowerUrl.includes('drive.google.com') || lowerUrl.includes('/assets/temarios') || lowerUrl.endsWith('.pdf') || lowerLabel.includes('temario') || lowerLabel.includes('pdf') || lowerLabel.includes('descargar');
      const isCourse = lowerUrl.includes('/cursos') || lowerLabel.includes('curso') || lowerLabel.includes('catálogo') || lowerLabel.includes('catalogo');
      const isSedes = lowerUrl.includes('/sedes') || lowerLabel.includes('sedes');
      const isCert = lowerUrl.includes('/certific') || lowerLabel.includes('certificado');

      // Si tiene botón explícito o coincide con alguna acción o contiene emojis de acción
      if (match.startsWith('[button:') || isWhatsApp || isTemario || isCourse || isSedes || isCert || /[\u{1F300}-\u{1F9FF}]/u.test(label)) {
        let btnClass = 'chatbot-button';
        if (isWhatsApp) {
          btnClass += ' chatbot-button--whatsapp';
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${btnClass}">${label}</a>`;
        } else if (isTemario) {
          btnClass += ' chatbot-button--temario';
          return `<a href="${url}" download target="_blank" rel="noopener noreferrer" class="${btnClass}">${label}</a>`;
        } else if (isCourse || isSedes || isCert) {
          btnClass += ' chatbot-button--course';
          return `<a href="${url}" class="${btnClass}">${label}</a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${btnClass}">${label}</a>`;
      }

      // Enlace regular
      if (isTemario) {
        return `<a href="${url}" download target="_blank" rel="noopener noreferrer" class="chatbot-link">${label}</a>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chatbot-link">${label}</a>`;
    });

    // Convertir listas con viñetas (- o *)
    const lines = html.split('\n');
    let inList = false;
    const parsedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listContent = trimmed.substring(2).trim();
        let prefix = '';
        if (!inList) {
          inList = true;
          prefix = '<ul class="chatbot-list">';
        }
        return `${prefix}<li>${listContent}</li>`;
      } else {
        let suffix = '';
        if (inList) {
          inList = false;
          suffix = '</ul>';
        }
        return `${suffix}${line}`;
      }
    });
    html = parsedLines.join('\n');
    if (inList) {
      html += '</ul>';
    }

    // Convertir saltos de línea a <br>
    html = html.replace(/\n/g, '<br>');

    // Limpiar saltos de línea redundantes generados por la apertura/cierre de listas
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<ul class="chatbot-list"><br>/g, '<ul class="chatbot-list">');

    return html;
  }

  handleMessageClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a') as HTMLAnchorElement;
    if (anchor) {
      const href = anchor.getAttribute('href');
      // No interceptar descargas de archivos ni enlaces externos
      if (anchor.hasAttribute('download') || (href && href.endsWith('.pdf'))) {
        return;
      }
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        event.preventDefault();
        this.router.navigateByUrl(href);
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          this.isOpen = false;
        }
      }
    }
  }

  updateDynamicSuggestions(userQuery: string, lastResponse: string): void {
    const query = userQuery ? userQuery.toLowerCase() : '';
    const reply = lastResponse.toLowerCase();

    // 1. Detección por palabras clave de la pregunta del usuario (Cursos específicos)
    const hasAuriculo = query.includes('auriculo');
    const hasAcupuntura7 = query.includes('7 meses') || query.includes('7meses');
    const hasAcupunturaAnual = query.includes('anual') || (query.includes('acupuntura') && !query.includes('7 meses'));
    const hasDigitopresion = query.includes('digitopres');
    const hasMasaje = query.includes('masaje');

    if (hasAuriculo) {
      // Ambas modalidades
      this.suggestions = ['🏫 Auriculoterapia Presencial', '💻 Auriculoterapia Online', '🔄 Volver al Inicio'];
      return;
    }
    if (hasAcupuntura7) {
      // Ambas modalidades
      this.suggestions = ['🏫 Acupuntura 7 Meses Presencial', '💻 Acupuntura 7 Meses Online', '🔄 Volver al Inicio'];
      return;
    }
    if (hasAcupunturaAnual) {
      // Ambas modalidades
      this.suggestions = ['🏫 Acupuntura Anual Presencial', '💻 Acupuntura Anual Online', '🔄 Volver al Inicio'];
      return;
    }
    if (hasDigitopresion) {
      // Solo una modalidad (Presencial)
      this.suggestions = ['🏫 Digitopresión Presencial', '📚 Ver más cursos', '🔄 Volver al Inicio'];
      return;
    }
    if (hasMasaje) {
      // Solo una modalidad (Online)
      this.suggestions = ['💻 Masaje Terapéutico Online', '📚 Ver más cursos', '🔄 Volver al Inicio'];
      return;
    }

    if (query.includes('inscrib') || query.includes('matricul') || query.includes('registro') || query.includes('pagar') || query.includes('pago')) {
      this.suggestions = ['📞 WhatsApp de Admisión', '📍 Dirección de la Sede', '🔄 Volver al Inicio'];
      return;
    }
    if (query.includes('contacto') || query.includes('telefono') || query.includes('direccion') || query.includes('donde') || query.includes('sede') || query.includes('ubicacion') || query.includes('mapa')) {
      this.suggestions = ['🏫 Sede Principal Lince', '🌿 Sede Huánuco', '📞 WhatsApp Central', '🔄 Volver al Inicio'];
      return;
    }
    if (query.includes('precio') || query.includes('costo') || query.includes('mensualidad') || query.includes('planes') || query.includes('cuanto') || query.includes('suscripcion')) {
      this.suggestions = ['🎖️ Plan Premium', '🏫 Cursos Presenciales', '💻 Cursos Online', '🔄 Volver al Inicio'];
      return;
    }
    if (query.includes('reflexologia') || query.includes('reflexología')) {
      this.suggestions = ['🏫 Reflexología Presencial', '💻 Reflexología Online', '🔄 Volver al Inicio'];
      return;
    }
    if (query.includes('curso') || query.includes('taller') || query.includes('programa') || query.includes('dictan') || query.includes('estudiar') || query.includes('ofreces') || query.includes('tienen')) {
      this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online'];
      return;
    }

    // 2. Detección por contexto de la respuesta del asistente (Fallback)
    if (reply.includes('presencial o virtual') || reply.includes('modalidad prefieres') || reply.includes('cursos presenciales o virtuales')) {
      this.suggestions = ['🏫 Cursos Presenciales', '💻 Cursos Online'];
    } else if (reply.includes('presenciales') && (reply.includes('acupuntura') || reply.includes('lince') || reply.includes('sede'))) {
      this.suggestions = ['💲 Precios de Cursos', '📝 ¿Cómo me inscribo?', '🔄 Volver al Inicio'];
    } else if (reply.includes('virtuales') || reply.includes('campus virtual') || reply.includes('suscripción') || reply.includes('online')) {
      this.suggestions = ['🎖️ Planes del Campus', '📝 ¿Cómo inscribirme?', '🔄 Volver al Inicio'];
    } else {
      this.suggestions = [...this.defaultSuggestions];
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.messageContainer) {
          const el = this.messageContainer.nativeElement;
          el.scrollTop = el.scrollHeight;
        }
      } catch (err) {
        // Ignorar fallas silenciosas en la carga
      }
    }, 50);
  }
}
