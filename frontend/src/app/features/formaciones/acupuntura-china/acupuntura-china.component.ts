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
  selector: 'app-acupuntura-china',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './acupuntura-china.component.html',
  styleUrls: ['./acupuntura-china.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaChinaComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Meses 1 al 3',
      icon: 'neurology',
      title: 'Comprende el mapa energético del cuerpo',
      description: 'Construye una base clara en medicina tradicional china, anatomía energética y localización de puntos.',
      outcomes: ['Canales y meridianos', 'Teoría de los cinco elementos', 'Evaluación energética inicial']
    },
    {
      shortTitle: 'Técnica',
      period: 'Meses 4 al 8',
      icon: 'medical_services',
      title: 'Desarrolla precisión técnica y criterio clínico',
      description: 'Aprende a seleccionar técnicas y combinaciones de puntos de acuerdo con objetivos terapéuticos concretos.',
      outcomes: ['Moxibustión y ventosas', 'Protocolos de tratamiento', 'Práctica supervisada']
    },
    {
      shortTitle: 'Profesión',
      period: 'Meses 9 al 12',
      icon: 'workspace_premium',
      title: 'Integra y presenta tu práctica profesional',
      description: 'Consolida protocolos completos y adquiere herramientas para incorporar la acupuntura a tu servicio profesional.',
      outcomes: ['Casos clínicos integrales', 'Microsistemas de acupuntura', 'Certificación institucional']
    }
  ];

  // Syllabus configuration data
  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Acupuntura Clásica (Meses 1-6)',
      title: 'Fase 1: Acupuntura Clásica',
      description: 'Estudio profundo de los principios milenarios, anatomía de canales energéticos y puntos reflejos primarios.',
      image: 'assets/plataforma_lms acupuntura temario 1.jpg',
      imageAlt: 'Acupuntura Clásica',
      specimenLabel: 'SPECIMEN // CANALES ENERGÉTICOS ACUPUNTURALES',
      items: [
        { number: '01', title: 'Canales y Meridianos', badge1: 'Teoría', badge2: 'Fase 1', description: 'Identificación y trazado de los 12 canales energéticos bilaterales y puntos de estimulación primarios en el cuerpo.' },
        { number: '02', title: 'Teoría de los 5 Elementos', badge1: 'Teoría', badge2: 'Filosofía', description: 'Modelo cosmológico, fisiológico y patológico que constituye la base teórica tradicional china.' },
        { number: '03', title: 'Moxibustión', badge1: 'Práctica', badge2: 'Calor', description: 'Aplicación de calor terapéutico mediante la combustión de la planta Artemisa en puntos acupunturales.' },
        { number: '04', title: 'Ventosaterapia', badge1: 'Fascias', badge2: 'Técnica', description: 'Liberación miofascial profunda y desintoxicación celular mediante ventosas secas y móviles.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Microsistemas (Meses 7-12)',
      title: 'Fase 2: Microsistemas de Acupuntura',
      description: 'Especialización en sistemas de estimulación refleja y técnicas avanzadas de estimulación eléctrica.',
      image: 'assets/plataforma_lms acupuntura temario 2.jpg',
      imageAlt: 'Microsistemas',
      specimenLabel: 'SPECIMEN // ESTIMULACIÓN REFLEJA Y MICROSISTEMAS',
      items: [
        { number: '01', title: 'Auriculoterapia', badge1: 'Reflejo', badge2: 'Fase 2', description: 'Diagnóstico reflejo y estimulación del pabellón auricular para control de desórdenes sistémicos.' },
        { number: '02', title: 'Craneopuntura', badge1: 'Neuronal', badge2: 'Fase 2', description: 'Estimulación refleja de las zonas corticales y neurológicas craneales para patologías complejas.' },
        { number: '03', title: 'Electroacupuntura', badge1: 'Tecno', badge2: 'Fase 2', description: 'Aplicación científica de frecuencias eléctricas a través de agujas de acupuntura para manejo analgésico.' },
        { number: '04', title: 'Reflexología Integral', badge1: 'Integral', badge2: 'Fase 2', description: 'Estudio anatómico y aplicación refleja sobre zonas reflejas podales, manuales y faciales.' }
      ]
    }
  ];

  // Teacher configuration data
  docenteData: DocenteData = {
    nombre: 'Lic. Lázaro José Regalado Ponte',
    cargo: 'Docente Especialista',
    biografia: 'Licenciado en <span class="text-brand-blue font-semibold">Fisioterapia y Rehabilitación</span>, especialista en acupuntura clínica, moxibustión y digitopuntura con amplia trayectoria académica y docente universitaria internacional en <span class="text-brand-blue font-semibold">Cuba y Perú</span>.',
    fotoUrl: 'assets/Lic Lazaro.jpg',
    kicker: 'DOCENCIA EXCLUSIVA',
    especialidades: [
      { icon: 'verified', label: 'Especialista Clínico' },
      { icon: 'school', label: 'Ex-Docente U.' }
    ]
  };

  // CTA configuration data
  ctaData: CourseCtaData = {
    precio: 270,
    cuotasInfo: '12 cuotas · Sin intereses · Matrícula incluida',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '12 meses de clases teóricas en vivo — acceso a grabaciones 24/7',
      'Fases clínicas presenciales supervisadas con pacientes reales',
      'Material didáctico digital oficial de por vida',
      'Certificado profesional oficial emitido por Plataforma LMS'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">carrera en acupuntura</span> es ahora.',
    description: 'Cada año abrimos una <span class="text-brand-blue font-semibold">sola convocatoria</span>. Una vez llenas las plazas, la siguiente oportunidad es en 2027. No postergues una decisión que puede transformar tu carrera.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. El programa comienza desde los fundamentos.' },
      { icon: 'schedule', pregunta: '¿Puedo estudiar trabajando?', respuesta: 'Sí. Las clases online en vivo son en horario nocturno y los sábados.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Plataforma LMS con respaldo institucional reconocido en Perú.' },
      { icon: 'location_on', pregunta: '¿Dónde son las prácticas?', respuesta: 'En nuestro centro clínico en Lince, Lima — grupos reducidos de máximo 8 personas.' }
    ],
    trustText: 'Pago seguro · Sin compromiso de permanencia · Asesoría personalizada antes de matricularte'
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
      'assets/Acupunturaplataforma_lms2.jpg',
      'assets/Acupunturaplataforma_lms3.jpg',
      'assets/Acupunturaplataforma_lms4.jpg'
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
