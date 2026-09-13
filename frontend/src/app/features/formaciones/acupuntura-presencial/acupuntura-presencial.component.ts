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
  selector: 'app-acupuntura-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './acupuntura-presencial.component.html',
  styleUrls: ['./acupuntura-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Meses 1 al 4',
      icon: 'neurology',
      title: 'Bases de la Medicina Tradicional China',
      description: 'Comprende los principios del Yin-Yang, los 5 elementos, los canales energéticos y la localización de puntos acupunturales.',
      outcomes: ['Canales y meridianos', 'Teoría de los 5 elementos', 'Localización de puntos']
    },
    {
      shortTitle: 'Técnica',
      period: 'Meses 5 al 8',
      icon: 'medical_services',
      title: 'Técnica de puntura y protocolos clínicos',
      description: 'Aprende las técnicas de inserción, estimulación y diseño de protocolos de tratamiento para las condiciones más frecuentes.',
      outcomes: ['Técnica de inserción segura', 'Moxibustión y ventosas', 'Protocolos terapéuticos']
    },
    {
      shortTitle: 'Práctica',
      period: 'Meses 9 al 12',
      icon: 'workspace_premium',
      title: 'Práctica clínica y microsistemas',
      description: 'Integra microsistemas de acupuntura, consolida tu práctica con casos reales y obtén tu certificación de Plataforma LMS.',
      outcomes: ['Auriculoterapia y craneopuntura', 'Casos clínicos integrales', 'Certificación institucional']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Acupuntura Clásica (Meses 1-6)',
      title: 'Fase 1: Acupuntura Clásica Presencial',
      description: 'Aprendizaje presencial de los principios de la MTC, los canales energéticos y las técnicas básicas de acupuntura.',
      image: 'assets/plan_estudios_acupuntura_presencial1.jpg',
      imageAlt: 'Acupuntura presencial',
      specimenLabel: 'SPECIMEN // CANALES ENERGÉTICOS Y PUNTOS ACUPUNTURALES',
      items: [
        { number: '01', title: 'Canales y Meridianos', badge1: 'Teoría', badge2: 'Fase 1', description: 'Identificación de los 12 canales bilaterales, los vasos maravillosos y los puntos de mayor uso clínico.' },
        { number: '02', title: 'Teoría de los 5 Elementos', badge1: 'Filosofía', badge2: 'Fase 1', description: 'Modelo cosmológico y fisiológico que fundamenta el diagnóstico y tratamiento en MTC.' },
        { number: '03', title: 'Técnica de Inserción', badge1: 'Práctica', badge2: 'Seguridad', description: 'Inserción, ángulos, profundidades y maniobras de estimulación de agujas con total seguridad clínica.' },
        { number: '04', title: 'Moxibustión y Ventosas', badge1: 'Complementaria', badge2: 'Fase 1', description: 'Aplicación terapéutica del calor y la presión al vacío como complemento del tratamiento acupuntural.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Microsistemas (Meses 7-12)',
      title: 'Fase 2: Microsistemas y Práctica Clínica',
      description: 'Especialización en microsistemas de acupuntura y práctica supervisada con pacientes reales.',
      image: 'assets/plan_estudios_acupuntura_presencial2.jpg',
      imageAlt: 'Microsistemas de acupuntura',
      specimenLabel: 'SPECIMEN // MICROSISTEMAS Y CASOS CLÍNICOS',
      items: [
        { number: '01', title: 'Auriculoterapia', badge1: 'Microsistema', badge2: 'Fase 2', description: 'Estimulación del pabellón auricular como microsistema reflejo para el abordaje de condiciones sistémicas.' },
        { number: '02', title: 'Craneopuntura', badge1: 'Neurológico', badge2: 'Fase 2', description: 'Técnica de estimulación de las zonas corticales proyectadas en el cráneo para patologías neurológicas.' },
        { number: '03', title: 'Electroacupuntura', badge1: 'Tecnología', badge2: 'Fase 2', description: 'Estimulación eléctrica de agujas para potenciar el efecto analgésico y acelerar la recuperación tisular.' },
        { number: '04', title: 'Casos Clínicos Integrales', badge1: 'Clínica', badge2: 'Supervisada', description: 'Evaluación completa, diagnóstico diferencial y tratamiento de casos reales bajo supervisión docente.' }
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
    precio: 270,
    cuotasInfo: '12 cuotas · Matrícula: S/ 30',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '12 meses de clases presenciales en Lince, Lima',
      'Práctica clínica supervisada con pacientes reales',
      'Material didáctico digital oficial de por vida',
      'Certificado profesional oficial emitido por Plataforma LMS'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">carrera en acupuntura</span> es ahora.',
    description: 'Cada año abrimos una <span class="text-brand-blue font-semibold">sola convocatoria presencial</span>. Una vez llenas las plazas, la siguiente oportunidad es en 2027.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. El programa comienza desde los fundamentos.' },
      { icon: 'schedule', pregunta: '¿Cuándo son las clases?', respuesta: 'Domingos y fines de semana en horario acordado con el grupo.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Plataforma LMS con respaldo institucional reconocido en Perú.' },
      { icon: 'location_on', pregunta: '¿Dónde son las prácticas?', respuesta: 'En nuestro centro clínico en Lince, Lima — grupos reducidos de máximo 8 personas.' }
    ],
    trustText: 'Pago seguro · Sin compromiso de permanencia · Asesoría personalizada antes de matricularte'
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
      'assets/formacion_acupuntura_presencial1.jpg',
      'assets/formacion_acupuntura_presencial2.jpg',
      'assets/formacion_acupuntura_presencial3.jpg'
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
