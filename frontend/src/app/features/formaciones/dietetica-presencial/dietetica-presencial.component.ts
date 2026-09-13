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
  selector: 'app-dietetica-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './dietetica-presencial.component.html',
  styleUrls: ['./dietetica-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DieteticaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  showBenefitLightbox = false;
  benefitLightboxImage = '';

  readonly journeySteps = [
    {
      shortTitle: 'Principios',
      period: 'Semanas 1 y 2',
      icon: 'nutrition',
      title: 'Principios de la dietética y alimentación saludable',
      description: 'Aprende las bases científicas de una alimentación equilibrada y el metabolismo de los nutrientes.',
      outcomes: ['Principios de la dietética', 'Alimentación saludable', 'Hábitos nutricionales']
    },
    {
      shortTitle: 'Planificación',
      period: 'Semanas 3 y 4',
      icon: 'monitoring',
      title: 'Planificación de dietas y hábitos',
      description: 'Diseña menús y dietas balanceadas para mejorar tu estilo de vida o el de otros de forma práctica.',
      outcomes: ['Planificación de dietas', 'Hábitos nutricionales', 'Certificación oficial']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Principios y Alimentación (Sem. 1-2)',
      title: 'Fase 1: Principios de la Dietética y Alimentación Saludable',
      description: 'Aprende los fundamentos de la dietética, metabolismo, y cómo lograr una alimentación equilibrada y de hábitos correctos.',
      image: 'assets/plan_estudios_dietetica1.jpg',
      imageAlt: 'Alimentación Saludable',
      specimenLabel: 'CURSO // PRINCIPIOS Y ALIMENTACIÓN',
      items: [
        { number: '01', title: 'Principios de la Dietética', badge1: 'Teoría', badge2: 'Semana 1', description: 'Fundamentos de la nutrición humana y el rol de los nutrientes en el cuerpo.' },
        { number: '02', title: 'Alimentación Saludable', badge1: 'Salud', badge2: 'Semana 2', description: 'Cómo estructurar comidas completas y nutritivas con hábitos sostenibles en el tiempo.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Planificación de Dietas (Sem. 3-4)',
      title: 'Fase 2: Planificación de Dietas y Cambios de Vida',
      description: 'Diseño de planes alimenticios personalizados y cómo construir hábitos duraderos de forma saludable.',
      image: 'assets/plan_estudios_dietetica2.jpg',
      imageAlt: 'Planificación de Dietas',
      specimenLabel: 'CURSO // PLANES Y NUTRICIÓN',
      items: [
        { number: '03', title: 'Planificación de Dietas', badge1: 'Práctica', badge2: 'Semana 3', description: 'Métodos para calcular porciones y diseñar menús adaptados a diferentes necesidades.' },
        { number: '04', title: 'Hábitos Nutricionales', badge1: 'Nutrición', badge2: 'Semana 4', description: 'Estrategias conductuales para mantener una alimentación saludable y evitar recaídas.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Karen Pacheco Díaz',
    cargo: 'Especialista en Nutrición y Dietética',
    biografia: 'La especialista <span class="text-brand-blue font-semibold">Karen Pacheco Díaz</span> te guiará paso a paso en el aprendizaje de la dietética, la planificación de menús equilibrados y la mejora de los hábitos nutricionales de forma práctica.',
    fotoUrl: 'assets/imagen_karen.jpg',
    kicker: 'ESPECIALISTA Y DOCENTE',
    especialidades: [
      { icon: 'verified', label: 'Especialista en Nutrición' },
      { icon: 'school', label: 'Docente Autorizada' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 250,
    cuotasInfo: 'Presencial: S/ 250.00 | Online: S/ 100.00',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20matricularme%20en%20el%20Curso%20de%20Diet%C3%A9tica',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Modalidad Presencial (Lince): S/ 250.00',
      'Modalidad Online (Aula Virtual): S/ 100.00',
      'Duración: 1 mes (Domingos 10:00 a.m. a 1:00 p.m.)',
      'Inicio oficial: 14 de Junio',
      'Incluye certificado oficial emitido por Plataforma LMS',
      'Temario práctico y cupos limitados'
    ],
    headlineHtml: '¡Inscríbete ahora y empieza a cambiar tu vida de forma saludable!',
    description: 'Aprende los principios de la dietética, alimentación saludable y hábitos de la mano de nuestra especialista. ¡Cupos limitados!',
    faqs: [
      { icon: 'help', pregunta: '¿Sin conocimientos previos?', respuesta: 'Completamente desde cero. El curso está diseñado para que cualquiera aprenda a comer mejor.' },
      { icon: 'payments', pregunta: '¿Cuáles son los costos?', respuesta: 'Presencial S/ 250.00 y Online S/ 100.00. Incluye certificado.' },
      { icon: 'verified', pregunta: '¿Incluye certificado?', respuesta: 'Sí, recibirás un certificado de Plataforma LMS al completar la formación.' },
      { icon: 'location_on', pregunta: '¿Dónde y cuándo es?', respuesta: 'Clases los Domingos de 10:00 a.m. a 1:00 p.m. Presencial en Lince o 100% Online.' }
    ],
    trustText: 'Pago seguro · Sello de calidad Plataforma LMS · Reserva de vacante inmediata'
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
    const images = ['assets/dietetica_1.jpg', 'assets/dietetica_2.jpg', 'assets/dietetica_3.jpg'];
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
