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
  selector: 'app-acupuntura-china-7-meses',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './acupuntura-china-7-meses.component.html',
  styleUrls: ['../acupuntura-presencial/acupuntura-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaChina7MesesComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private hostElement: HTMLElement;

  readonly journeySteps = [
    {
      shortTitle: 'Filosofía y MTC',
      period: 'Meses 1 al 3',
      icon: 'neurology',
      title: 'Bases y Diagnóstico de la Medicina Tradicional China',
      description: 'Estudia el Yin-Yang como fundamento de la salud y aprende a diferenciar patrones energéticos como deficiencias y excesos.',
      outcomes: ['Bases filosóficas de la MTC', 'Yin-Yang y los 5 elementos', 'Diagnóstico de desequilibrios']
    },
    {
      shortTitle: 'Localización',
      period: 'Meses 4 al 5',
      icon: 'medical_services',
      title: 'Puntos y Sistema de Medición (Cun)',
      description: 'Domina la localización exacta de los principales puntos terapéuticos usando medidas tradicionales Cun y referencias corporales.',
      outcomes: ['Medición con Cun', 'Puntos Lieque, Hegu, Neiguan', 'Anatomía de los canales']
    },
    {
      shortTitle: 'Práctica y Seguridad',
      period: 'Meses 6 al 7',
      icon: 'workspace_premium',
      title: 'Formación Clínica con Seguridad Profesional',
      description: 'Aplica razonamiento clínico y protocolos de tratamiento presencial respetando estrictas medidas de seguridad y bioseguridad.',
      outcomes: ['Prácticas con pacientes reales', 'Precauciones y contraindicaciones', 'Certificación oficial final']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Fundamentos y Diagnóstico (Meses 1-4)',
      title: 'Fase 1: Fundamentos teóricos y Patrones energéticos',
      description: 'Aprende los principios de la MTC, la interpretación de desequilibrios y la diferenciación de patrones de exceso y deficiencia.',
      image: 'assets/plan_estudios_acupuntura_7_meses_1.jpg',
      imageAlt: 'Fundamentos de acupuntura',
      specimenLabel: 'SPECIMEN // TEORÍA Y DIAGNÓSTICO EN MTC',
      items: [
        { number: '01', title: 'Bases Filosóficas de la MTC', badge1: 'Teoría', badge2: 'Meses 1-2', description: 'El ser humano como microcosmos, la relación Cielo-Hombre-Tierra, armonía y equilibrio Yin-Yang.' },
        { number: '02', title: 'El Verdadero Diagnóstico', badge1: 'Diagnóstico', badge2: 'Meses 2-3', description: 'Evaluación del estado energético, síntomas, antecedentes y circulación del Qi del paciente.' },
        { number: '03', title: 'Patrones Energéticos', badge1: 'Patrones', badge2: 'Meses 3-4', description: 'Diferenciación clínica de deficiencias (Qi, Yin, Yang) y excesos (estancamiento, calor, humedad).' },
        { number: '04', title: 'Fundamento del Yin-Yang', badge1: 'Filosofía', badge2: 'Meses 4', description: 'Restablecimiento funcional mediante la identificación de estados de exceso y deficiencia.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Puntos y Práctica Clínica (Meses 5-7)',
      title: 'Fase 2: Medición Cun, Puntos Clave y Seguridad Clínica',
      description: 'Especialización práctica en localización de puntos terapéuticos, maniobras de acupuntura y protocolos seguros con pacientes.',
      image: 'assets/plan_estudios_acupuntura_7_meses_2.jpg',
      imageAlt: 'Práctica clínica de acupuntura',
      specimenLabel: 'SPECIMEN // PUNTOS Y SEGURIDAD CLÍNICA',
      items: [
        { number: '01', title: 'Localización Precisa (Cun)', badge1: 'Medición', badge2: 'Meses 5', description: 'Uso de las medidas tradicionales Cun y referencias anatómicas adaptadas a cada paciente.' },
        { number: '02', title: 'Puntos Terapéuticos Principales', badge1: 'Práctica', badge2: 'Meses 5-6', description: 'Estudio y aplicación de puntos clave como P7, HE7, IG4, H3, MC6, R3, E36, GB34, IG11, BP6.' },
        { number: '03', title: 'Efectos y Acción Terapéutica', badge1: 'Acupuntura', badge2: 'Meses 6-7', description: 'Regulación energética, mejora de la circulación de Qi y Sangre, y fortalecimiento orgánico.' },
        { number: '04', title: 'Seguridad y Contraindicaciones', badge1: 'Clínica', badge2: 'Meses 7', description: 'Bioseguridad, contraindicaciones absolutas y precauciones anatómicas regionales en consulta.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Lic. Lázaro José Regalado Ponte',
    cargo: 'Docente Especialista',
    biografia: 'Licenciado en <span class="text-brand-blue font-semibold">Fisioterapia y Rehabilitación</span>, especialista en acupuntura clínica, moxibustión y digitopuntura con amplia trayectoria académica y docente universitaria en <span class="text-brand-blue font-semibold">Cuba y Perú</span>.',
    fotoUrl: 'assets/Lic Lazaro.jpg',
    kicker: 'DOCENCIA EXCLUSIVA',
    especialidades: [
      { icon: 'verified', label: 'Especialista Clínico' },
      { icon: 'school', label: 'Ex-Docente U.' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 150,
    cuotasInfo: 'Matrícula: S/ 30 · Mensualidad: S/ 150',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20informaci%C3%B3n%20sobre%20el%20curso%20de%207%20meses%20de%20Acupuntura%20China',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '7 meses de clases presenciales intensivas en Lince, Lima',
      'Práctica clínica supervisada con pacientes reales',
      'Material didáctico digital oficial de por vida',
      'Certificado profesional oficial emitido por Plataforma LMS'
    ],
    headlineHtml: 'Formación Intensiva de 7 Meses en<br><span class="text-secondary">Acupuntura China</span>.',
    description: 'Aprende los principios de la Medicina Tradicional China y domina la práctica clínica de la acupuntura de forma segura.',
    faqs: [
      { icon: 'payments', pregunta: '¿Cuál es el costo del curso?', respuesta: 'La matrícula es de S/ 30 soles y la mensualidad es de S/ 150 soles.' },
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. El programa inicia desde las bases teóricas.' },
      { icon: 'schedule', pregunta: '¿Cuál es el horario?', respuesta: 'Clases presenciales los fines de semana en Lince, coordinado con el grupo.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Certificado oficial con respaldo institucional de Plataforma LMS.' },
      { icon: 'location_on', pregunta: '¿Cómo son las prácticas?', respuesta: 'Prácticas supervisadas con pacientes reales en grupos pequeños de máximo 8 personas.' }
    ],
    trustText: 'Reserva segura · Vacantes muy limitadas por grupo para garantizar la enseñanza práctica'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) {
    this.hostElement = host.nativeElement;
  }

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
    const images = [
      'assets/acupuntura_7_meses_estudios_1.jpg',
      'assets/acupuntura_7_meses_estudios_2.jpg',
      'assets/acupuntura_7_meses_estudios_3.jpg'
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
    }, this.hostElement);
    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void { this.stopAutoplay(); this.animationContext?.revert(); }
}
