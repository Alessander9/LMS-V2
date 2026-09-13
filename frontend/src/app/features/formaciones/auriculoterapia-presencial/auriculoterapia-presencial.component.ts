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
  selector: 'app-auriculoterapia-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './auriculoterapia-presencial.component.html',
  styleUrls: ['./auriculoterapia-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuriculoterapiaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Neurofisiología',
      period: 'Módulo 1',
      icon: 'neurology',
      title: 'Comprende la neurofisiología y vertientes',
      description: 'Estudia la historia (Dr. Paul Nogier), vertientes china, francesa y neuromodulación, junto con la relevancia del Nervio Vago y la teoría polivagal.',
      outcomes: ['Aportes del Dr. Paul Nogier', 'Nervio Vago y neurofisiología', 'Teoría polivagal y convergencia']
    },
    {
      shortTitle: 'Somatotopía',
      period: 'Módulo 2',
      icon: 'hearing',
      title: 'Domina la somatotopía y materiales de aplicación',
      description: 'Aprende el mapeo auricular del feto invertido, el uso de materiales invasivos (agujas, ASP), no invasivos (semillas, balines) y masaje auricular.',
      outcomes: ['Somatotopía y cartografías', 'Materiales invasivos y no invasivos', 'Técnica exclusiva de masaje auricular']
    },
    {
      shortTitle: 'Protocolos',
      period: 'Módulo 3',
      icon: 'medical_services',
      title: 'Aplica la Tríada auricular y protocolos clínicos',
      description: 'Implementa la Tríada (Shen Men, Riñón, Simpático), localización por áreas y protocolos para dolor, estrés, peso y bioseguridad.',
      outcomes: ['Tríada auricular de inicio', 'Protocolos clínicos específicos', 'Higiene, bioseguridad y ética']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: 'Módulo 1: Neurofisiología',
      title: 'Módulo 1: Fundamentos y Neurofisiología',
      description: 'Historia de la auriculoterapia, aportes de Nogier, vertientes principales y la neurofisiología del Nervio Vago.',
      image: 'assets/plan_estudios_auriculoterapia_1.jpg',
      imageAlt: 'Módulo 1 - Fundamentos y Neurofisiología',
      specimenLabel: 'SPECIMEN // FUNDAMENTOS Y NEUROFISIOLOGÍA',
      items: [
        { number: '01', title: 'Historia de la Auriculoterapia', badge1: 'Teoría', badge2: 'Dr. Nogier', description: 'Historia de la auriculoterapia y aportes fundamentales del Dr. Paul Nogier.' },
        { number: '02', title: 'Vertientes Principales', badge1: 'Sistemas', badge2: 'Comparativo', description: 'Vertientes China, Francesa y Neuromodulación auricular.' },
        { number: '03', title: 'Neurofisiología y Nervio Vago', badge1: 'Clínica', badge2: 'Vago', description: 'Neurofisiología auricular e importancia clínica del Nervio Vago.' },
        { number: '04', title: 'Teorías Energéticas y Biológicas', badge1: 'Conceptos', badge2: 'Biológicas', description: 'Teoría de convergencia y Teoría polivagal aplicadas a la terapia.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: 'Módulo 2: Somatotopía',
      title: 'Módulo 2: Somatotopía y Materiales de aplicación',
      description: 'Cartografía del feto invertido, uso de materiales invasivos y no invasivos, y técnica exclusiva de masaje auricular.',
      image: 'assets/plan_estudios_auriculoterapia_2.jpg',
      imageAlt: 'Módulo 2 - Somatotopía y Materiales',
      specimenLabel: 'SPECIMEN // SOMATOTOPÍA Y MATERIALES',
      items: [
        { number: '01', title: 'Somatotopía Auricular', badge1: 'Mapeo', badge2: 'Feto Invertido', description: 'Somatotopía auricular: analogía del feto invertido y cartografías oficiales.' },
        { number: '02', title: 'Materiales Invasivos', badge1: 'Agujas', badge2: 'ASP', description: 'Uso de agujas de acupuntura, chinchetas, ASP y aplicador.' },
        { number: '03', title: 'Materiales No Invasivos', badge1: 'Semillas', badge2: 'Balines', description: 'Semillas de vaccaria, balines de oro/plata e imanes.' },
        { number: '04', title: 'Masaje Auricular Exclusivo', badge1: 'Técnica', badge2: 'Emanuel C.', description: 'Técnica exclusiva de masaje auricular desarrollada por Emanuel Cabanillas.' }
      ]
    },
    {
      id: 'fase3',
      tabLabel: 'Módulo 3: Puntos y Protocolos',
      title: 'Módulo 3: Puntos Auriculares y Protocolos Clínicos',
      description: 'Tríada auricular, localización detallada por áreas y protocolos específicos con bioseguridad.',
      image: 'assets/plan_estudios_auriculoterapia_3.jpg',
      imageAlt: 'Módulo 3 - Puntos y Protocolos',
      specimenLabel: 'SPECIMEN // PROTOCOLOS CLÍNICOS Y ÉTICA',
      items: [
        { number: '01', title: 'Protocolo de Inicio', badge1: 'Tríada', badge2: 'Shen Men', description: 'Protocolo de inicio: Tríada auricular (Shen Men, Riñón, Simpático).' },
        { number: '02', title: 'Localización por Áreas', badge1: 'Anatomía', badge2: 'Puntos', description: 'Localización detallada por áreas: Antitrago, Trago, Anti-hélix, Hélix, Lóbulo y Concha.' },
        { number: '03', title: 'Protocolos Clínicos Específicos', badge1: 'Tratamiento', badge2: 'Salud', description: 'Protocolos clínicos específicos: estrés, ansiedad, insomnio, dolor musculoesquelético y control de peso.' },
        { number: '04', title: 'Bioseguridad y Ética', badge1: 'Higiene', badge2: 'Asepsia', description: 'Higiene, desinfección, bioseguridad y ética en consulta con pacientes.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Emanuel Cabanillas Bardales',
    cargo: 'Docente principal de Auriculoterapia',
    biografia: 'Especialista en Auriculoterapia y Medicinas Complementarias con amplia trayectoria clínica en la aplicación de protocolos reflejos, diagnóstico auricular e integración terapéutica.',
    fotoUrl: 'assets/Lic Emanuel.jpg',
    kicker: 'DOCENCIA Plataforma LMS',
    especialidades: [
      { icon: 'verified', label: 'Especialista clínico' },
      { icon: 'school', label: 'Docente Plataforma LMS' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 260,
    cuotasInfo: '2 meses · Matrícula S/ 30 · Reserva S/ 50 (vía WhatsApp)',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20reservar%20mi%20cupo%20para%20la%20Formaci%C3%B3n%20de%20Auriculoterapia',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '2 meses de clases presenciales (domingos 10:00 AM – 1:00 PM)',
      'Sede: Julio C Tello 438, Lince, Lima, Perú',
      'Kit de materiales clínicos e impresos incluidos',
      'Docente: Emanuel Cabanillas Bardales'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">práctica en auriculoterapia</span> es ahora.',
    description: 'Cupos <span class="text-brand-blue font-semibold">limitados</span> en Lince, Lima. Reserva de cupo S/ 50.00 vía WhatsApp.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. Comenzamos desde la anatomía auricular básica.' },
      { icon: 'schedule', pregunta: '¿Cuándo y dónde son las clases?', respuesta: 'Domingos de 10:00 AM a 1:00 PM en Julio C Tello 438, Lince, Lima, Perú.' },
      { icon: 'payments', pregunta: '¿Cómo es el pago?', respuesta: 'Matrícula S/ 30, Mensualidad S/ 260 por mes. Reserva tu cupo con S/ 50 vía WhatsApp.' },
      { icon: 'verified', pregunta: '¿Quién dicta el curso?', respuesta: 'Emanuel Cabanillas Bardales.' }
    ],
    trustText: 'Reserva segura · Asesoría personalizada vía WhatsApp +51 939 371 250'
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
    const images = [
      'assets/plan_estudios_auriculoterapia_1.jpg',
      'assets/formacion_auriculoterapia_presencial_2.jpg',
      'assets/formacion_auriculoterapia_presencial_3.jpg'
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

  ngOnDestroy(): void { this.stopAutoplay(); this.animationContext?.revert(); }
}
