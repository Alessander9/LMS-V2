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
  selector: 'app-masaje-terapeutico',
  standalone: true,
  imports: [
    CommonModule, 
    NavbarComponent, 
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './masaje-terapeutico.component.html',
  styleUrls: ['./masaje-terapeutico.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MasajeTerapeticoComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: any;

  readonly journeySteps = [
    {
      shortTitle: 'Miofascial',
      period: 'Sesión 1',
      icon: 'self_improvement',
      title: 'Comprende los fundamentos miofasciales',
      description: 'Principios anatómicos del tejido blando, palpación diagnóstica y técnicas básicas de masaje.',
      outcomes: ['Sistema fascial', 'Maniobras básicas', 'Palpación diagnóstica']
    },
    {
      shortTitle: 'Digitopresión',
      period: 'Sesión 2',
      icon: 'biotech',
      title: 'Domina la digitopresión mecánica',
      description: 'Presión instrumental clínica, dosificación de fuerza y cuidado articular del terapeuta.',
      outcomes: ['Instrumentación de presión', 'Zonas de tratamiento', 'Ergonomía del terapeuta']
    },
    {
      shortTitle: 'Clínico',
      period: 'Sesión 3',
      icon: 'medical_services',
      title: 'Abordaje clínico del dolor',
      description: 'Protocolos de tratamiento para lumbalgias, cervicalgias y síndromes de tensión crónicos.',
      outcomes: ['Protocolos para contracturas', 'Estiramiento asistido', 'Contraindicaciones']
    },
    {
      shortTitle: 'Práctica',
      period: 'Sesión 4',
      icon: 'workspace_premium',
      title: 'Aplicación y práctica integrada',
      description: 'Casos prácticos de simulación integradora en el aula y feedback en tiempo real del docente.',
      outcomes: ['Prácticas en camilla', 'Fichas de evaluación', 'Evaluación supervisada']
    }
  ];

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  // Syllabus configuration data
  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: 'Sesión 1: Miofascial',
      title: 'Sesión 1: Fundamentos Miofasciales',
      description: 'Principios anatómicos del tejido blando, palpación diagnóstica y técnicas básicas.',
      image: 'assets/plataforma_lms masaje temario 1.jpg',
      imageAlt: 'Miofascial',
      specimenLabel: 'SPECIMEN // PALPACIÓN Y ANATOMÍA MIOFASCIAL',
      items: [
        { number: '01', title: 'Sistema Fascial', badge1: 'Teoría', badge2: 'Fascias', description: 'Anatomía del sistema fascial y Puntos de Gatillo (Trigger Points) en el cuerpo humano.' },
        { number: '02', title: 'Maniobras Básicas', badge1: 'Práctica', badge2: 'Técnicas', description: 'Deslizamiento profundo, amasamiento y fricción controlada en la musculatura superficial.' },
        { number: '03', title: 'Palpación Diagnóstica', badge1: 'Evaluación', badge2: 'Diagnóstico', description: 'Palpación y reconocimiento de bandas tensas en el tejido blando para localizar contracturas clínicas.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: 'Sesión 2: Digitopresión',
      title: 'Sesión 2: Digitopresión Mecánica',
      description: 'Presión instrumental clínica, dosificación de fuerza y cuidado articular del terapeuta.',
      image: 'assets/plataforma_lms masaje temario 2.jpg',
      imageAlt: 'Digitopresión',
      specimenLabel: 'SPECIMEN // DIGITOPRESORES E INSTRUMENTOS',
      items: [
        { number: '01', title: 'Instrumentación de Presión', badge1: 'Herramientas', badge2: 'Madera', description: 'Uso de digitopresores profesionales de madera y resina para puntos gatillo difíciles.' },
        { number: '02', title: 'Zonas de Tratamiento', badge1: 'Focalizado', badge2: 'Espalda', description: 'Tratamiento de espalda alta, zona dorsal, trapecios y cervicales mediante presión y liberación fascial.' },
        { number: '03', title: 'Ergonomía del Terapeuta', badge1: 'Postura', badge2: 'Ergo', description: 'Ergonomía corporal y posicionamiento óptimo del terapeuta durante el masaje.' }
      ]
    },
    {
      id: 'fase3',
      tabLabel: 'Sesión 3: Clínico',
      title: 'Sesión 3: Abordaje Clínico del Dolor',
      description: 'Protocolos de tratamiento para lumbalgias, cervicalgias y síndromes de tensión crónicos.',
      image: 'assets/plataforma_lms masaje temario 3.jpg',
      imageAlt: 'Abordaje Clínico',
      specimenLabel: 'SPECIMEN // MANIOBRAS DE TRACCIÓN Y ALIVIO',
      items: [
        { number: '01', title: 'Protocolos para Contracturas', badge1: 'Tratamiento', badge2: 'Lumbares', description: 'Protocolos clínicos estructurados para lumbalgias, contracturas severas y puntos gatillo complejos.' },
        { number: '02', title: 'Estiramiento Asistido', badge1: 'Alivio', badge2: 'Tracción', description: 'Técnicas de estiramiento muscular asistido y maniobras de tracción pos-tratamiento.' },
        { number: '03', title: 'Contraindicaciones', badge1: 'Clínica', badge2: 'Límites', description: 'Estudio de indicaciones clínicas, contraindicaciones absolutas y relativas para un tratamiento seguro.' }
      ]
    },
    {
      id: 'fase4',
      tabLabel: 'Sesión 4: Práctica',
      title: 'Sesión 4: Aplicación y Práctica Integrada',
      description: 'Casos prácticos de simulación integradora en el aula y feedback en tiempo real.',
      image: 'assets/plataforma_lms masaje temario 4.jpg',
      imageAlt: 'Práctica',
      specimenLabel: 'SPECIMEN // CASOS CLÍNICOS Y SIMULACIONES',
      items: [
        { number: '01', title: 'Prácticas en Camilla', badge1: 'Vivencial', badge2: 'Camilla', description: 'Simulación clínica completa en camilla con control de tiempos, trato al paciente e informe de sesión.' }
      ]
    }
  ];

  // Teacher configuration data
  docenteData: DocenteData = {
    nombre: 'Emanuel Cabanillas Bardales',
    cargo: 'Docente Especialista',
    biografia: '<span class=\"text-brand-blue font-semibold\">Fisioterapeuta</span> con más de 12 años de experiencia clínica, instructor de Pilates clínico, especialista en terapias manuales y medicina tradicional china. <span class=\"text-brand-blue font-semibold\">Ponente de primer nivel</span> exclusivo en Plataforma LMS.',
    fotoUrl: 'assets/Lic Emanuel.jpg',
    kicker: 'DOCENCIA EXCLUSIVA',
    especialidades: [
      { icon: 'verified', label: '+12 años de Exp.' },
      { icon: 'school', label: 'Ponente Exclusivo' }
    ]
  };

  // CTA configuration data
  ctaData: CourseCtaData = {
    precio: 260,
    cuotasInfo: 'Matrícula S/ 30 + 1 mensualidad de S/ 260 · Sin intereses',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Manual impreso exclusivo paso a paso',
      'Uso de digitopresores profesionales en clase',
      'Certificado oficial emitido por Plataforma LMS',
      'Práctica supervisada con feedback directo del docente'
    ],
    headlineHtml: 'Domina la liberación del<br><span class=\"text-secondary\">dolor muscular</span>',
    description: 'Asegura un lugar en la camilla de prácticas presenciales en Lince. Manual teórico y digitopresores de resina incluidos.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. El curso comienza desde los fundamentos anatómicos.' },
      { icon: 'schedule', pregunta: '¿Cuánto dura el curso?', respuesta: '4 sesiones intensivas los domingos. 3:00 PM — 6:00 PM en Lince.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Plataforma LMS con respaldo institucional reconocido.' },
      { icon: 'groups', pregunta: '¿Cuántos alumnos por clase?', respuesta: 'Grupos reducidos de máximo 8 personas para garantizar práctica personalizada.' }
    ],
    trustText: 'Pago seguro · Camillas limitadas · Materiales incluidos · Feedback directo del docente'
  };

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

  prevBenefit() {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false) {
    if (!isAuto) {
      this.resetAutoplay();
    }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number) {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }

    openBenefitLightbox(): void {
    const images = [
      'assets/MasajeDigitoPresionplataforma_lms4.jpg',
      'assets/MasajeDigitoPresionplataforma_lms3.jpg',
      'assets/MasajeDigitoPresionplataforma_lms2.jpg'
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
