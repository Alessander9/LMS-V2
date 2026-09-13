import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { CourseSyllabusComponent, SyllabusPhase } from '../../../shared/components/course-syllabus/course-syllabus.component';
import { DocenteSectionComponent, DocenteData } from '../../../shared/components/docente-section/docente-section.component';
import { CourseCtaComponent, CourseCtaData } from '../../../shared/components/course-cta/course-cta.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-digitopresion-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './digitopresion-presencial.component.html',
  styleUrls: ['./digitopresion-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DigitopresionPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Semana 1 al 3',
      icon: 'touch_app',
      title: 'Bases anatómicas y técnica manual',
      description: 'Aprende anatomía muscular aplicada, palpación terapéutica y los principios de la presión digital en puntos clave.',
      outcomes: ['Anatomía palpable', 'Puntos de presión', 'Seguridad terapéutica']
    },
    {
      shortTitle: 'Técnica',
      period: 'Semana 4 al 6',
      icon: 'front_hand',
      title: 'Protocolos clínicos de digitopresión',
      description: 'Desarrolla secuencias y protocolos de tratamiento para contracturas, tensión y dolor musculoesquelético.',
      outcomes: ['Protocolos de dolor', 'Maniobras especiales', 'Práctica supervisada']
    },
    {
      shortTitle: 'Profesión',
      period: 'Semana 7 al 8',
      icon: 'workspace_premium',
      title: 'Integración clínica y certificación',
      description: 'Consolida tu práctica con casos reales y obtén la certificación que respalda tu competencia profesional.',
      outcomes: ['Casos clínicos reales', 'Evaluación práctica', 'Certificación institucional']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Digitopresión Clásica (Semanas 1-4)',
      title: 'Fase 1: Fundamentos de Digitopresión',
      description: 'Aprendizaje de la anatomía muscular palpable y técnicas de presión digital para el manejo del dolor y las contracturas.',
      image: 'assets/plan_estudios_digitopresion_presencial_1.jpg',
      imageAlt: 'Digitopresión clínica',
      specimenLabel: 'SPECIMEN // PUNTOS DE PRESIÓN TERAPÉUTICA',
      items: [
        { number: '01', title: 'Anatomía Muscular Aplicada', badge1: 'Teoría', badge2: 'Fase 1', description: 'Identificación de grupos musculares, inserciones y puntos gatillo de mayor relevancia clínica.' },
        { number: '02', title: 'Técnica de Palpación', badge1: 'Práctica', badge2: 'Fase 1', description: 'Desarrollo de sensibilidad palmar para ubicar contracturas, nódulos y zonas de tensión tisular.' },
        { number: '03', title: 'Puntos de Presión Digital', badge1: 'Técnica', badge2: 'Reflejo', description: 'Localización y estimulación de puntos terapéuticos de alta efectividad para el alivio del dolor.' },
        { number: '04', title: 'Seguridad y Contraindicaciones', badge1: 'Clínica', badge2: 'Fase 1', description: 'Criterios de aplicación segura, contraindicaciones absolutas y relativas, e higiene postural del terapeuta.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Protocolos Avanzados (Semanas 5-8)',
      title: 'Fase 2: Protocolos Clínicos',
      description: 'Diseño y aplicación de protocolos completos de tratamiento para condiciones musculoesqueléticas frecuentes.',
      image: 'assets/plan_estudios_digitopresion_presencial_2.jpg',
      imageAlt: 'Protocolo de digitopresión',
      specimenLabel: 'SPECIMEN // PROTOCOLOS DE TRATAMIENTO MANUAL',
      items: [
        { number: '01', title: 'Cervicalgia y Contractura', badge1: 'Protocolo', badge2: 'Fase 2', description: 'Secuencia terapéutica para el abordaje de la tensión cervical, trapecios y región escapular.' },
        { number: '02', title: 'Dolor Lumbar', badge1: 'Protocolo', badge2: 'Fase 2', description: 'Maniobras específicas para la región lumbar, cadena posterior y musculatura paravertebral.' },
        { number: '03', title: 'Digitopresión Refleja', badge1: 'Reflejo', badge2: 'Fase 2', description: 'Integración de puntos reflejos y zonas de estimulación indirecta para el equilibrio sistémico.' },
        { number: '04', title: 'Casos Clínicos Integrales', badge1: 'Clínica', badge2: 'Práctica', description: 'Evaluación y tratamiento completo de casos reales bajo supervisión docente directa.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Emanuel Cabanillas Bardales',
    cargo: 'Docente principal',
    biografia: 'Especialista en técnicas manuales, masoterapia clínica, anatomía aplicada y digitopresión con amplia trayectoria clínica en la formación de terapeutas profesionales.',
    fotoUrl: 'assets/Lic Emanuel.jpg',
    kicker: 'DOCENCIA Plataforma LMS',
    especialidades: [
      { icon: 'verified', label: 'Especialista Clínico' },
      { icon: 'school', label: 'Docente principal' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 250,
    cuotasInfo: '2 meses · Matrícula S/ 30 · Clases los domingos (3:00 PM – 6:00 PM)',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20reservar%20mi%20cupo%20para%20la%20Formaci%C3%B3n%20de%20Masaje%20Terap%C3%A9utico%20y%20Digitopresi%C3%B3n%20Mec%C3%A1nica',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '2 meses de clases presenciales (domingos 3:00 PM – 6:00 PM)',
      'Sede: Julio C Tello 438, Lince, Lima, Perú',
      'Práctica presencial 100% interactiva en camillas',
      'Docente: Emanuel Cabanillas Bardales'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">carrera en digitopresión</span> es ahora.',
    description: 'Cupos <span class="text-brand-blue font-semibold">limitados por sesión</span> en Lince, Lima. Matrícula S/ 30.00.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. Comenzamos desde las bases prácticas elementales.' },
      { icon: 'schedule', pregunta: '¿Cuál es el horario y sede?', respuesta: 'Domingos de 3:00 PM a 6:00 PM en Julio C Tello 438, Lince, Lima, Perú.' },
      { icon: 'verified', pregunta: '¿Qué certificación recibo?', respuesta: 'Constancia oficial emitida por Plataforma LMS respaldando tu formación.' },
      { icon: 'location_on', pregunta: '¿Cómo me inscribo?', respuesta: 'Puedes reservar por WhatsApp al +51 939 371 250.' }
    ],
    trustText: 'Reserva segura · Asesoría personalizada vía WhatsApp +51 939 371 250'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.startAutoplay();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextBenefit(true);
    }, 4500);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
  }

  resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  prevBenefit(): void {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false): void {
    if (!isAuto) { this.resetAutoplay(); }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }

    openBenefitLightbox(): void {
    const images = [
      'assets/formacion_digitopresion_presencial_1.jpg',
      'assets/formacion_digitopresion_presencial_2.jpg',
      'assets/formacion_digitopresion_presencial_3.jpg'
    ];
    this.benefitLightboxImage = images[this.activeBenefitIndex];
    this.showBenefitLightbox = true;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeBenefitLightbox(): void {
    this.showBenefitLightbox = false;
    this.benefitLightboxImage = '';
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animationContext = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      hero
        .from('.ac-kicker', { opacity: 0, y: -12, duration: 0.45 })
        .from('.ac-title', { opacity: 0, y: 28, duration: 0.8 }, '-=0.2')
        .from('.ac-description, .ac-actions, .ac-proof', { opacity: 0, y: 14, stagger: 0.08, duration: 0.45 }, '-=0.45')
        .from('.ac-hero__visual', { opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.65')
        .from('.ac-fact', { opacity: 0, y: 12, stagger: 0.07, duration: 0.4 }, '-=0.4');

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.set(element, { autoAlpha: 1, y: 0 });
        ScrollTrigger.create({
          trigger: element,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.fromTo(element,
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }
            );
          }
        });
      });
      window.setTimeout(() => {
        gsap.set('[data-reveal]', { autoAlpha: 1, y: 0, clearProps: 'visibility,opacity,transform' });
      }, 1200);
    }, this.host.nativeElement);
    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
