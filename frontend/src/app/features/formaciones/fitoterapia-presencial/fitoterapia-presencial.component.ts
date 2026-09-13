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
  selector: 'app-fitoterapia-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './fitoterapia-presencial.component.html',
  styleUrls: ['./fitoterapia-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FitoterapiaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  showBenefitLightbox = false;
  benefitLightboxImage = '';

  readonly journeySteps = [
    {
      shortTitle: 'Sistemas',
      period: 'Semanas 1 y 2',
      icon: 'nutrition',
      title: 'Bases de la fitoterapia y sistemas digestivo/endocrino',
      description: 'Aprende los principios de la medicina natural, uso seguro de plantas medicinales y aplicaciones clínicas en el sistema digestivo y endocrino.',
      outcomes: ['Fitoterapia digestiva', 'Fitoterapia endocrina', 'Uso seguro de plantas']
    },
    {
      shortTitle: 'Aplicación',
      period: 'Semanas 3 y 4',
      icon: 'monitoring',
      title: 'Sistema nervioso y preparaciones clínicas',
      description: 'Domina la fitoterapia aplicada al sistema nervioso, combinaciones, dosificaciones y preparación de fórmulas en casos clínicos.',
      outcomes: ['Sistema nervioso', 'Preparaciones específicas', 'Protocolos basados en evidencia']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Principios y Sistemas (Sem. 1-2)',
      title: 'Fase 1: Fundamentos de Fitoterapia y Sistemas Digestivo/Endocrino',
      description: 'Aprende los conceptos básicos de la fitoterapia, dosificaciones seguras y su aplicación terapéutica en los sistemas digestivo y endocrino.',
      image: 'assets/plan_fitoterapia1.jpg',
      imageAlt: 'Plantas medicinales y fitoterapia',
      specimenLabel: 'CURSO // SISTEMAS BIOLÓGICOS',
      items: [
        { number: '01', title: 'Principios y Acción Terapéutica', badge1: 'Teoría', badge2: 'Semana 1', description: 'Historia de la fitoterapia, principios activos de las plantas medicinales y mecanismos de acción biológica.' },
        { number: '02', title: 'Fitoterapia para el Sistema Digestivo', badge1: 'Clínica', badge2: 'Semana 1', description: 'Tratamiento natural de gastritis, colon irritable, estreñimiento y dispepsia mediante plantas medicinales.' },
        { number: '03', title: 'Fitoterapia para el Sistema Endocrino', badge1: 'Clínica', badge2: 'Semana 2', description: 'Regulación hormonal, plantas medicinales para el soporte de la tiroides y el control glucémico natural.' },
        { number: '04', title: 'Uso Seguro y Dosificación', badge1: 'Seguridad', badge2: 'Semana 2', description: 'Evitar interacciones farmacológicas, toxicidad, contraindicaciones y cálculo de dosis terapéuticas.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Sistema Nervioso y Fórmulas (Sem. 3-4)',
      title: 'Fase 2: Fitoterapia del Sistema Nervioso y Formulaciones Especiales',
      description: 'Estudio de plantas medicinales para el manejo del estrés, ansiedad y preparación práctica de fórmulas adaptadas a casos clínicos.',
      image: 'assets/plan_fitoterapia2.jpg',
      imageAlt: 'Preparación de fitoterapia',
      specimenLabel: 'CURSO // PROTOCOLOS CLÍNICOS',
      items: [
        { number: '01', title: 'Fitoterapia para el Sistema Nervioso', badge1: 'Clínica', badge2: 'Semana 3', description: 'Plantas ansiolíticas, adaptógenas y sedantes para el manejo del estrés, insomnio y fatiga crónica.' },
        { number: '02', title: 'Preparaciones y Formulación Práctica', badge1: 'Práctica', badge2: 'Semana 3', description: 'Cómo preparar y dosificar infusiones, cocimientos, tinturas madres y extractos de forma segura.' },
        { number: '03', title: 'Indicaciones and Combinaciones', badge1: 'Teoría', badge2: 'Semana 4', description: 'Sinergia de plantas medicinales: cómo combinar especies para potenciar su efecto terapéutico.' },
        { number: '04', title: 'Protocolos de Casos Clínicos', badge1: 'Casos', badge2: 'Semana 4', description: 'Resolución de casos clínicos reales diseñando protocolos naturales personalizados basados en evidencia.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Karen Pacheco Díaz',
    cargo: 'Especialista en Nutrición y Dietética',
    biografia: 'La especialista <span class="text-brand-blue font-semibold">Karen Pacheco Díaz</span> te guiará paso a paso en el aprendizaje de la dietética, la planificación de menús equilibrados y la mejora de los hábitos nutricionales de forma práctica.',
    fotoUrl: 'assets/imagen_karen.jpg',
    kicker: 'DOCENCIA ESPECIALIZADA',
    especialidades: [
      { icon: 'verified', label: 'Especialista en Fitoterapia' },
      { icon: 'school', label: 'Docente Autorizado' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 250,
    cuotasInfo: 'Presencial: S/ 250.00 | Online: S/ 100.00',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20matricularme%20en%20el%20Curso%20de%20Fitoterapia',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Modalidad Presencial: S/ 250.00',
      'Modalidad Online: S/ 100.00',
      'Duración: 1 mes (Clases todos los domingos)',
      'Horario: 10:00 a.m. – 1:00 p.m.',
      'Inicio oficial: 2 de Agosto',
      'Incluye certificado emitido por Plataforma LMS',
      'Casos clínicos prácticos y basados en evidencia'
    ],
    headlineHtml: '¡Separa tu vacante y aprende a utilizar las plantas medicinales!',
    description: 'Aprende a formular y utilizar la medicina natural de forma práctica, segura y basada en la evidencia científica. ¡Cupos limitados!',
    faqs: [
      { icon: 'help', pregunta: '¿Necesito conocimientos?', respuesta: 'No. El curso comienza desde las bases científicas y está diseñado para todo público interesado en la medicina natural.' },
      { icon: 'payments', pregunta: '¿Cuáles son los costos?', respuesta: 'Presencial S/ 250.00 y Online S/ 100.00. Ambas modalidades incluyen acceso a material oficial y certificado.' },
      { icon: 'verified', pregunta: '¿Incluye certificado?', respuesta: 'Sí, recibirás tu certificación oficial emitida por Plataforma LMS al finalizar la formación.' },
      { icon: 'location_on', pregunta: '¿Horario y Dirección?', respuesta: 'Domingos de 10:00 a.m. a 1:00 p.m. Presencial en Lince, Lima o en nuestro campus virtual.' }
    ],
    trustText: 'Reserva segura · Respaldo institucional Plataforma LMS · Acceso inmediato a material didáctico'
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
    const images = ['assets/fitoterapia_1.jpg', 'assets/fitoterapia_2.jpg', 'assets/fitoterapia_3.jpg'];
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
