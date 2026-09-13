import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PresencialCourse {
  slug: string;
  type: string;
  titleLead: string;
  titleAccent: string;
  edition: string;
  description: string;
  duration: string;
  price: string;
  priceLabel: string;
  schedule: string;
  image: string;
  icon: string;
  color: string;
  softColor: string;
  outcomes: string[];
  modules: Array<{ number: string; title: string; description: string; icon: string }>;
  audience: Array<{ title: string; description: string; icon: string }>;
  journeySteps: Array<{
    shortTitle: string;
    period: string;
    icon: string;
    title: string;
    description: string;
    outcomes: string[];
  }>;
}

const COURSES: Record<string, PresencialCourse> = {
  'reflexologia-podal-presencial': {
    slug: 'reflexologia-podal-presencial', type: 'Taller Full Day', titleLead: 'Taller de', titleAccent: 'Reflexología Podal', edition: 'Jornada práctica',
    description: 'Aprende a interpretar zonas reflejas del pie y aplicar una secuencia terapéutica para promover relajación, equilibrio y bienestar integral.',
    duration: 'Full Day', price: 'S/ 130.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'assets/reflexologia_img_curso.jpg', icon: 'footprint', color: '#256657', softColor: '#e6f3ef',
    outcomes: ['Mapa podal ilustrado', 'Secuencia práctica completa', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Mapa reflejo', description: 'Correspondencia entre pies, órganos y sistemas.', icon: 'map' },
      { number: '02', title: 'Preparación', description: 'Valoración, higiene, postura y acondicionamiento.', icon: 'clean_hands' },
      { number: '03', title: 'Técnicas', description: 'Presiones, deslizamientos y movilización del pie.', icon: 'front_hand' },
      { number: '04', title: 'Protocolos', description: 'Secuencias para estrés, digestión y tensión corporal.', icon: 'assignment' }
    ],
    audience: [
      { title: 'Masajistas', description: 'Para incorporar reflexología a sus sesiones.', icon: 'front_hand' },
      { title: 'Terapeutas', description: 'Para sumar una técnica relajante y no invasiva.', icon: 'spa' },
      { title: 'Público general', description: 'Para aprender autocuidado y bienestar familiar.', icon: 'family_home' }
    ],
    journeySteps: [
      { shortTitle: 'Fundamentos', period: 'Bloque 1', icon: 'map', title: 'Comprende el mapa reflejo del pie', description: 'Aprende la correspondencia entre zonas del pie, órganos y sistemas del cuerpo humano.', outcomes: ['Mapa podal completo', 'Correspondencias orgánicas', 'Principios de la reflexología'] },
      { shortTitle: 'Técnica', period: 'Bloque 2', icon: 'front_hand', title: 'Desarrolla precisión manual y sensibilidad', description: 'Practica presiones digitales, deslizamientos y técnicas de movilización articular del pie.', outcomes: ['Presión y deslizamiento', 'Movilización articular', 'Secuencia completa'] },
      { shortTitle: 'Protocolos', period: 'Bloque 3', icon: 'assignment', title: 'Aplica secuencias terapéuticas completas', description: 'Integra todo lo aprendido en protocolos para estrés, digestión y alivio corporal.', outcomes: ['Protocolo antiestrés', 'Abordaje digestivo', 'Certificación Plataforma LMS'] }
    ]
  },
  'paralisis-facial-presencial': {
    slug: 'paralisis-facial-presencial', type: 'Taller Full Day', titleLead: 'Acupuntura en', titleAccent: 'Parálisis Facial', edition: 'Práctica clínica',
    description: 'Entrenamiento intensivo para abordar la parálisis facial mediante acupuntura, estimulación refleja y ejercicios complementarios de rehabilitación.',
    duration: 'Full Day', price: 'S/ 180.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'assets/paralisis_facial_img_curso.jpg', icon: 'face', color: '#74455f', softColor: '#f4eaf0',
    outcomes: ['Guía de puntos faciales', 'Práctica de localización', 'Protocolo clínico estructurado'],
    modules: [
      { number: '01', title: 'Bases anatómicas', description: 'Nervio facial, músculos y signos clínicos.', icon: 'neurology' },
      { number: '02', title: 'Valoración', description: 'Reconocimiento de fases y criterios de atención.', icon: 'diagnosis' },
      { number: '03', title: 'Puntos terapéuticos', description: 'Selección local, distal y auricular.', icon: 'adjust' },
      { number: '04', title: 'Práctica integrada', description: 'Secuencia, seguimiento y recomendaciones.', icon: 'clinical_notes' }
    ],
    audience: [
      { title: 'Acupunturistas', description: 'Para especializar su abordaje neuromuscular.', icon: 'adjust' },
      { title: 'Fisioterapeutas', description: 'Para complementar la rehabilitación facial.', icon: 'physical_therapy' },
      { title: 'Profesionales de salud', description: 'Para actualizar criterios y protocolos de apoyo.', icon: 'medical_services' }
    ],
    journeySteps: [
      { shortTitle: 'Anatomía', period: 'Bloque 1', icon: 'neurology', title: 'Comprende la anatomía del nervio facial', description: 'Estudia la inervación facial, los músculos implicados y los signos clínicos característicos.', outcomes: ['Nervio facial y ramas', 'Músculos de la expresión', 'Signos clínicos'] },
      { shortTitle: 'Diagnóstico', period: 'Bloque 2', icon: 'diagnosis', title: 'Aprende a valorar y clasificar cada caso', description: 'Reconoce las fases de la parálisis facial and aplica criterios de atención diferenciados.', outcomes: ['Fases clínicas', 'Criterios de atención', 'Evaluación inicial'] },
      { shortTitle: 'Práctica', period: 'Bloque 3', icon: 'clinical_notes', title: 'Integra puntos y secuencias terapéuticas', description: 'Selecciona puntos locales, distales y auriculares para un abordaje completo.', outcomes: ['Puntos faciales clave', 'Secuencia de tratamiento', 'Certificación Plataforma LMS'] }
    ]
  },
  'moxibustion-ventosas-presencial': {
    slug: 'moxibustion-ventosas-presencial', type: 'Taller / Seminario', titleLead: 'Moxibustión y', titleAccent: 'Ventosaterapia', edition: 'Técnicas tradicionales',
    description: 'Aprende a aplicar calor terapéutico y presión negativa para aliviar tensión, movilizar tejidos y complementar tratamientos de bienestar.',
    duration: '1 o 2 días', price: 'Desde S/ 130.00', priceLabel: 'Pago único', schedule: 'Presencial · Intensivo', image: 'assets/Acupunturaplataforma_lms2.jpg', icon: 'local_fire_department', color: '#a04422', softColor: '#faebe4',
    outcomes: ['Materiales de práctica', 'Protocolos de seguridad', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Moxibustión', description: 'Fundamentos, tipos de moxa y aplicación segura.', icon: 'local_fire_department' },
      { number: '02', title: 'Ventosas', description: 'Ventosa fija, móvil y técnicas de succión.', icon: 'bubble_chart' },
      { number: '03', title: 'Indicaciones', description: 'Dolor, frío, tensión muscular y circulación.', icon: 'fact_check' },
      { number: '04', title: 'Práctica', description: 'Preparación, secuencias y manejo del material.', icon: 'science' }
    ],
    audience: [
      { title: 'Acupunturistas', description: 'Para potenciar tratamientos tradicionales.', icon: 'adjust' },
      { title: 'Masajistas', description: 'Para complementar liberación muscular y fascial.', icon: 'front_hand' },
      { title: 'Terapeutas', description: 'Para sumar calor y vacío a su práctica.', icon: 'spa' }
    ],
    journeySteps: [
      { shortTitle: 'Moxibustión', period: 'Bloque 1', icon: 'local_fire_department', title: 'Domina la técnica del calor terapéutico', description: 'Aprende los fundamentos de la moxibustión, tipos de moxa y su aplicación segura.', outcomes: ['Tipos de moxa', 'Técnicas de combustión', 'Seguridad y contraindicaciones'] },
      { shortTitle: 'Ventosas', period: 'Bloque 2', icon: 'bubble_chart', title: 'Aplica ventosas con criterio terapéutico', description: 'Practica ventosa fija, móvil y técnicas de succión controlada.', outcomes: ['Ventosa fija y móvil', 'Succión controlada', 'Liberación miofascial'] },
      { shortTitle: 'Práctica', period: 'Bloque 3', icon: 'science', title: 'Integra calor y vacío en protocolos', description: 'Combina ambas técnicas en secuencias para dolor, tensión y circulación.', outcomes: ['Protocolos combinados', 'Práctica supervisada', 'Certificación Plataforma LMS'] }
    ]
  },
  'stretching-terapeutico-presencial': {
    slug: 'stretching-terapeutico-presencial', type: 'Taller Full Day', titleLead: 'Taller de', titleAccent: 'Stretching Terapéutico', edition: 'Movilidad y recuperación',
    description: 'Aprende estiramientos asistidos para mejorar movilidad, reducir tensión y diseñar sesiones seguras de recuperación corporal.',
    duration: 'Full Day', price: 'S/ 130.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'assets/img_curso_stretching_online.jpg', icon: 'accessibility_new', color: '#365f94', softColor: '#e8f0fa',
    outcomes: ['Manual de secuencias', 'Práctica por cadenas musculares', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Movilidad', description: 'Rangos articulares y evaluación inicial.', icon: 'accessibility_new' },
      { number: '02', title: 'Cadenas musculares', description: 'Lectura de tensiones y patrones acortados.', icon: 'route' },
      { number: '03', title: 'Estiramiento asistido', description: 'Técnicas pasivas, activas y controladas.', icon: 'sports_gymnastics' },
      { number: '04', title: 'Sesión terapéutica', description: 'Dosificación, secuencia y contraindicaciones.', icon: 'assignment' }
    ],
    audience: [
      { title: 'Masajistas', description: 'Para cerrar sesiones con movilidad segura.', icon: 'front_hand' },
      { title: 'Entrenadores', description: 'Para mejorar recuperación y flexibilidad.', icon: 'fitness_center' },
      { title: 'Fisioterapeutas', description: 'Para ampliar recursos de movilidad asistida.', icon: 'physical_therapy' }
    ],
    journeySteps: [
      { shortTitle: 'Evaluación', period: 'Bloque 1', icon: 'accessibility_new', title: 'Evalúa rangos articulares y tensiones', description: 'Aprende a medir movilidad y detectar patrones de acortamiento muscular.', outcomes: ['Rangos articulares', 'Evaluación postural', 'Detección de tensiones'] },
      { shortTitle: 'Técnica', period: 'Bloque 2', icon: 'sports_gymnastics', title: 'Domina el estiramiento asistido', description: 'Practica técnicas pasivas, activas y controladas para cada grupo muscular.', outcomes: ['Estiramiento pasivo', 'Estiramiento activo', 'Técnicas controladas'] },
      { shortTitle: 'Sesión', period: 'Bloque 3', icon: 'assignment', title: 'Diseña sesiones terapéuticas completas', description: 'Integra secuencias seguras dosificando intensidad según cada persona.', outcomes: ['Dosificación segura', 'Secuencia completa', 'Certificación Plataforma LMS'] }
    ]
  }
};

@Component({
  selector: 'app-presencial-course',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './presencial-course.component.html',
  styleUrls: ['./presencial-course.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class PresencialCourseComponent implements OnInit, AfterViewInit, OnDestroy {
  course: PresencialCourse;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private animationContext?: gsap.Context;

  constructor(route: ActivatedRoute, private readonly host: ElementRef<HTMLElement>) {
    const slug = route.snapshot.data['course'] as string;
    this.course = COURSES[slug] ?? COURSES['reflexologia-podal-presencial'];
  }

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
    if (!isAuto) this.resetAutoplay();
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
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85',
      this.course.image,
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85'
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
