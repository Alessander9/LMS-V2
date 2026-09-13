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
  selector: 'app-electroacupuntura',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './electroacupuntura.component.html',
  styleUrls: ['./electroacupuntura.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ElectroacupunturaComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Domina la Técnica',
      period: 'Módulo 01',
      icon: 'bolt',
      title: 'Fundamentos, bioelectricidad y manejo profesional de equipos',
      description: 'Domina los principios de la electroacupuntura, la neurofisiología del dolor y la correcta configuración y calibración de los equipos de estimulación.',
      outcomes: [
        'Bioelectricidad y mecanismos analgésicos',
        'Frecuencias, ondas, intensidad y parámetros clínicos',
        'Manejo y calibración del electroestimulador',
        'Bioseguridad, precauciones y contraindicaciones'
      ]
    },
    {
      shortTitle: 'Aplica en la Práctica',
      period: 'Módulo 02',
      icon: 'medical_services',
      title: 'Protocolos clínicos para dolor, traumatología, neurología y estética',
      description: 'Aprende a integrar la electroacupuntura en diferentes contextos clínicos mediante protocolos prácticos y una correcta selección de parámetros.',
      outcomes: [
        'Tratamiento del dolor y traumatología',
        'Aplicaciones en neurología y parálisis facial',
        'Aplicaciones en estética y bienestar',
        'Selección de puntos, colocación de agujas y conexión de canales'
      ]
    },
    {
      shortTitle: 'Casos Reales & Sesión',
      period: 'Metodología',
      icon: 'verified',
      title: 'Desarrollo y seguimiento de sesiones clínicas reales',
      description: 'Observa la preparación del equipo, el ajuste progresivo de parámetros y el seguimiento de casos reales durante la formación del seminario.',
      outcomes: [
        'Preparación del entorno y del paciente',
        'Ajuste progresivo de la intensidad',
        'Monitoreo clínico continuo',
        '100% grabado con disponibilidad inmediata'
      ]
    }
  ];

  // Syllabus configuration data
  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Domina la Técnica',
      title: '01 · Fundamentos, Bioelectricidad y Manejo de Equipos',
      description: 'Domina los principios de la electroacupuntura, la neurofisiología del dolor y la correcta configuración de los equipos.',
      image: 'assets/electroAcupuntura_IMG/01.jpg',
      imageAlt: 'Plan de estudios electroacupuntura - Módulo 1',
      specimenLabel: 'MÓDULO 01 // FUNDAMENTOS & EQUIPOS',
      items: [
        {
          number: '01',
          title: '⚡ Bioelectricidad y Mecanismos Analgésicos',
          badge1: 'Bioelectricidad',
          badge2: 'Neurofisiología',
          description: 'Mecanismos de acción analgésica y bioeléctrica a nivel del sistema nervioso central y periférico.'
        },
        {
          number: '02',
          title: '⚙️ Frecuencias, Ondas, Intensidad y Parámetros Clínicos',
          badge1: 'Frecuencia (Hz)',
          badge2: 'Tipos de Onda',
          description: 'Diferenciación de ondas continuas, densas y dispersas. Selección y ajuste preciso de parámetros según objetivos clínicos.'
        },
        {
          number: '03',
          title: '🎛️ Manejo y Calibración del Electroestimulador',
          badge1: 'Equipos',
          badge2: 'Canales & Polaridad',
          description: 'Manejo de canales de salida, polaridad positiva/negativa, conexión segura de clips y verificación de continuidad.'
        },
        {
          number: '04',
          title: '🛡️ Bioseguridad, Precauciones y Contraindicaciones',
          badge1: 'Bioseguridad',
          badge2: 'Protocolos Seguros',
          description: 'Pautas esenciales para una aplicación segura, zonas de precaución y contraindicaciones clínicas.'
        }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Aplica en la Práctica',
      title: '02 · Aplicación Clínica y Protocolos Terapéuticos',
      description: 'Aprende a integrar la electroacupuntura en diferentes contextos clínicos mediante protocolos prácticos y una correcta selección de parámetros.',
      image: 'assets/electroAcupuntura_IMG/02.jpg',
      imageAlt: 'Plan de estudios electroacupuntura - Módulo 2',
      specimenLabel: 'MÓDULO 02 // APLICACIÓN CLÍNICA',
      items: [
        {
          number: '01',
          title: '🩺 Tratamiento del Dolor y Traumatología',
          badge1: 'Dolor Agudo/Crónico',
          badge2: 'Traumatología',
          description: 'Protocolos de alto impacto para lumbalgias, ciática, afecciones articulares y contracturas musculares profundas.'
        },
        {
          number: '02',
          title: '🧠 Aplicaciones en Neurología',
          badge1: 'Neurología',
          badge2: 'Parálisis Facial',
          description: 'Rehabilitación del impulso motor, abordaje de la parálisis facial periférica y estimulación neuromuscular.'
        },
        {
          number: '03',
          title: '✨ Aplicaciones en Estética y Bienestar',
          badge1: 'Estética Facial',
          badge2: 'Tonificación',
          description: 'Técnicas microeléctricas para estimulación del colágeno, lifting facial y armonización estética.'
        },
        {
          number: '04',
          title: '📍 Selección de Puntos, Colocación de Agujas y Conexión de Canales',
          badge1: 'Puntos Clave',
          badge2: 'Conexión de Canales',
          description: 'Criterios de selección topográfica, inserción de agujas, fijación de electrodos y organización de cables.'
        },
        {
          number: '05',
          title: '📈 Desarrollo y Seguimiento de una Sesión Práctica',
          badge1: 'Sesión Práctica',
          badge2: 'Monitoreo',
          description: 'Desarrollo paso a paso de la sesión clínica: preparación del paciente, ajuste progresivo de intensidad y seguimiento.'
        }
      ]
    }
  ];

  // Teacher configuration data
  docenteData: DocenteData = {
    nombre: 'Lic. Lázaro Regalado Ponte',
    cargo: 'Docente Especialista en Medicina Tradicional China & Electroacupuntura',
    biografia: 'Docente clínico de amplia trayectoria internacional, especialista en <span class="text-brand-blue font-semibold">Medicina Tradicional China y Electroacupuntura Clínica</span>. Reconocido formador con demostraciones prácticas sobre casos clínicos reales en el aula virtual de <span class="text-brand-blue font-semibold">Plataforma LMS</span>.',
    fotoUrl: 'assets/Lic Lazaro.jpg',
    kicker: 'DOCENCIA ESPECIALIZADA',
    especialidades: [
      { icon: 'bolt', label: 'Especialista en Electroacupuntura' },
      { icon: 'school', label: '8 Horas de Formación Grabada' },
      { icon: 'verified', label: 'Casos Clínicos Reales' }
    ]
  };

  // CTA configuration data
  ctaData: CourseCtaData = {
    precio: 180,
    cuotasInfo: 'Seminario Grabado · 8 Horas · 100% Disponibilidad Inmediata · Pago único',
    plazasDisponibles: 12,
    whatsappLink: 'https://wa.me/51939371250?text=' + encodeURIComponent('Hola, deseo inscribirme en el Curso Virtual de Electroacupuntura (S/ 180) con el Lic. Lázaro Regalado Ponte'),
    email: 'TerapiasintegralesPlataforma LMS@gmail.com',
    beneficios: [
      'Seminario completo grabado con 8 horas de contenido intensivo',
      'Teoría aplicada a la práctica con demostración en casos clínicos reales',
      '100% disponibilidad inmediata para estudiar a tu propio ritmo',
      'Manual en PDF descargable con frecuencias (Hz), parámetros y mapas clínicos',
      'Certificado Oficial con código QR emitido por Plataforma LMS'
    ],
    headlineHtml: 'Domina la<br><span class="text-[#0088ff] dark:text-[#23b7dd]">Electroacupuntura Clínica</span>.',
    description: 'Teoría aplicada a la práctica con casos reales durante la formación del seminario. 100% disponibilidad inmediata en formato grabado.',
    faqs: [
      {
        icon: 'schedule',
        pregunta: '¿Cuál es la duración del seminario?',
        respuesta: 'El seminario cuenta con 8 horas completas de contenido grabado en alta definición, disponible de forma inmediata tras tu inscripción.'
      },
      {
        icon: 'person',
        pregunta: '¿Quién dicta la formación?',
        respuesta: 'La formación está a cargo del docente especialista Lic. Lázaro Regalado Ponte.'
      },
      {
        icon: 'devices',
        pregunta: '¿Cómo es la metodología del curso?',
        respuesta: 'Es 100% online y grabado, combinando teoría explicativa y aplicación práctica directa sobre casos clínicos reales.'
      },
      {
        icon: 'payments',
        pregunta: '¿Cuál es el costo y formas de pago?',
        respuesta: 'El costo total es de S/ 180 soles (pago único). Puedes pagar con Yape, Plin o transferencia bancaria y acceder al instante.'
      }
    ],
    trustText: 'Inversión: S/ 180 · 8 Horas · 100% Disponibilidad Inmediata · Certificado Oficial'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) {}

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
    if (!isAuto) {
      this.resetAutoplay();
    }
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
      'assets/electroAcupuntura_IMG/01yara.jpg',
      'assets/electroAcupuntura_IMG/02yara.jpg',
      'assets/electroAcupuntura_IMG/03yara.jpg'
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
    if (typeof window === 'undefined') return;

    const revealSections = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-reveal]');
    revealSections.forEach((element) => {
      gsap.set(element, { clearProps: 'opacity,visibility,transform' });
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
        gsap.from(element, {
          y: 18,
          duration: 0.25,
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 92%', once: true }
        });
      });
    }, this.host.nativeElement);

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
