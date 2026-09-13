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
  selector: 'app-aromaterapia-flores-bach',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './aromaterapia-flores-bach.component.html',
  styleUrls: ['./aromaterapia-flores-bach.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AromaterapiaFloresBachComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  showBenefitLightbox = false;
  benefitLightboxImage = '';

  showFlyerLightbox = false;

  openFlyerLightbox(): void {
    this.showFlyerLightbox = true;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closeFlyerLightbox(): void {
    this.showFlyerLightbox = false;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  readonly journeySteps = [
    {
      shortTitle: 'Aromaterapia',
      period: 'Semanas 1 y 2',
      icon: 'spa',
      title: 'Bases de la Aromaterapia Clínica y Aceites Esenciales',
      description: 'Aprende los principios de la aromaterapia, química básica de los aceites esenciales, diluciones seguras y protocolos para el bienestar físico y mental.',
      outcomes: ['Propiedades de aceites esenciales', 'Diluciones y mezclas seguras', 'Protocolos para dolor y estrés']
    },
    {
      shortTitle: 'Flores de Bach',
      period: 'Semanas 3 y 4',
      icon: 'local_florist',
      title: 'Sistema Floral de Edward Bach y Fórmulas Personalizadas',
      description: 'Domina los 38 remedios florales, abordaje de desequilibrios emocionales y preparación de fórmulas terapéuticas integradas a tu consulta.',
      outcomes: ['Los 38 elixires florales y Rescue Remedy', 'Diagnóstico y anamnesis emocional', 'Elaboración de fórmulas prácticas']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Aromaterapia Clínica (Sem. 1-2)',
      title: 'Fase 1: Fundamentos de Aromaterapia y Aceites Esenciales',
      description: 'Conoce los principios científicos y terapéuticos de la aromaterapia, métodos de extracción, aceites vehiculares, dosificaciones y vías de administración seguras.',
      image: 'assets/aromaterapia_estudio_1.jpg',
      imageAlt: 'Formulación y aceites esenciales en aromaterapia',
      specimenLabel: 'CURSO // AROMATERAPIA CLÍNICA',
      items: [
        { number: '01', title: 'Principios y Vías de Acción de la Aromaterapia', badge1: 'Teoría', badge2: 'Semana 1', description: 'Historia, calidad y pureza de aceites esenciales, absorción olfativa, cutánea y respuesta del sistema límbico.' },
        { number: '02', title: 'Propiedades Terapéuticas y Perfil de Esencias', badge1: 'Clínica', badge2: 'Semana 1', description: 'Lavanda, árbol de té, eucalipto, bergamota, incienso, menta y sinergias aromáticas clave.' },
        { number: '03', title: 'Vehiculares, Diluciones y Dosificación Segura', badge1: 'Seguridad', badge2: 'Semana 2', description: 'Aceites portadores (jojoba, almendras, coco), porcentajes de dilución según edad, contraindicaciones y precauciones.' },
        { number: '04', title: 'Protocolos de Aplicación en Dolor y Estrés', badge1: 'Práctica', badge2: 'Semana 2', description: 'Elaboración de brumas, aceites de masaje terapéutico, roll-on e inhaladores personales para contracturas y ansiedad.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Flores de Bach y Consulta (Sem. 3-4)',
      title: 'Fase 2: Terapia Floral de Bach e Integración Holística',
      description: 'Estudio integral del sistema de Edward Bach, los 7 grupos emocionales, preparación de frascos goteros y combinación con aromaterapia para casos clínicos.',
      image: 'assets/aromaterapia_estudio_2.jpg',
      imageAlt: 'Remedios florales de Bach y terapia emocional',
      specimenLabel: 'CURSO // TERAPIA FLORAL DE BACH',
      items: [
        { number: '01', title: 'Filosofía Floral y los 7 Grupos de Bach', badge1: 'Filosofía', badge2: 'Semana 3', description: 'Miedos, incertidumbre, desinterés en el presente, soledad, hipersensibilidad, desaliento y preocupación excesiva.' },
        { number: '02', title: 'Los 38 Remedios Florales y Rescue Remedy', badge1: 'Materia Médica', badge2: 'Semana 3', description: 'Identificación clínica de cada flor (Mimulus, Rock Rose, Larch, Impatiens, Walnut, etc.) y uso de la fórmula de rescate.' },
        { number: '03', title: 'Diagnóstico Emocional y Elaboración de Fórmulas', badge1: 'Práctica', badge2: 'Semana 4', description: 'Metodología de entrevista terapéutica, selección de esencias personalizadas, esterilización y preparación de goteros.' },
        { number: '04', title: 'Abordaje Integral y Casos Clínicos Reales', badge1: 'Casos', badge2: 'Semana 4', description: 'Diseño de protocolos sinérgicos combinando Aromaterapia y Flores de Bach para insomnio, estrés, duelo y fatiga.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Karen Pacheco D.',
    cargo: 'Especialista en Terapias Integrales',
    biografia: 'La especialista <span class="text-brand-blue font-semibold">Karen Pacheco D.</span> te guiará paso a paso para dominar el uso terapéutico de los aceites esenciales y las Flores de Bach, brindándote herramientas clínicas prácticas para potenciar tu consulta.',
    fotoUrl: 'assets/imagen_karen.jpg',
    kicker: 'DOCENCIA ESPECIALIZADA',
    especialidades: [
      { icon: 'spa', label: 'Especialista en Aromaterapia' },
      { icon: 'local_florist', label: 'Terapeuta Floral de Bach' },
      { icon: 'verified', label: 'Docente Autorizada Plataforma LMS' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 200,
    cuotasInfo: 'Presencial: S/ 200.00 | Online: S/ 120.00',
    plazasDisponibles: 6,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20matricularme%20en%20el%20Curso%20de%20Aromaterapia%20y%20Flores%20de%20Bach',
    email: 'TerapiasintegralesPlataforma LMS@gmail.com',
    beneficios: [
      'Modalidad Presencial (Lince – Lima): S/ 200.00',
      'Modalidad Online (En vivo / Campus): S/ 120.00',
      'Duración: 1 mes (Clases todos los domingos)',
      'Horario: 10:00 a. m. – 1:00 p. m.',
      'Inicio oficial: 6 de Septiembre',
      'Incluye Certificado Oficial emitido por Plataforma LMS',
      'Manuales digitales de esencias, preparados y fichas clínicas'
    ],
    headlineHtml: '¡Reserva tu vacante y potencia tu práctica terapéutica!',
    description: 'Aprende a integrar el poder curativo de los aceites esenciales y las Flores de Bach con respaldo profesional y rigor clínico. ¡Cupos limitados!',
    faqs: [
      { icon: 'help', pregunta: '¿Necesito conocimientos previos?', respuesta: 'No. El curso inicia desde los fundamentos botánicos, terapéuticos y emocionales para que cualquier persona o terapeuta pueda aplicarlo con seguridad.' },
      { icon: 'payments', pregunta: '¿Cuáles son las opciones de inversión?', respuesta: 'Presencial S/ 200.00 y Online S/ 120.00. Ambas modalidades incluyen material didáctico, acceso a contenidos y certificación oficial.' },
      { icon: 'verified', pregunta: '¿El certificado tiene valor curricular?', respuesta: 'Sí, recibirás tu certificación oficial emitida por el Instituto Superior de Terapias Integrales Plataforma LMS.' },
      { icon: 'schedule', pregunta: '¿Cuándo inicia y en qué horario se dicta?', respuesta: 'Inicia el 6 de Septiembre. Se dicta todos los domingos de 10:00 a. m. a 1:00 p. m. (Presencial en Lince, Lima o vía Aula Virtual).' }
    ],
    trustText: 'Reserva segura · Respaldo institucional Plataforma LMS · Cupos estrictamente limitados'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) { }

  ngOnInit(): void { this.startAutoplay(); }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => { this.nextBenefit(true); }, 4500);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) { clearInterval(this.autoplayInterval); this.autoplayInterval = undefined; }
  }

  resetAutoplay(): void { this.stopAutoplay(); this.startAutoplay(); }

  prevBenefit(): void {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false): void {
    if (!isAuto) { this.resetAutoplay(); }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number): void { this.resetAutoplay(); this.activeBenefitIndex = i; }

  setJourneyStep(index: number): void { this.activeJourneyStep = index; }

  openBenefitLightbox(): void {
    const images = ['assets/aromaterapia_1.jpg', 'assets/aromaterapia_2.jpg', 'assets/aromaterapia_3.jpg'];
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

  ngOnDestroy(): void { this.stopAutoplay(); this.animationContext?.revert(); }
}
