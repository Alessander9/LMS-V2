import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { CourseSyllabusComponent, SyllabusPhase } from '../../../shared/components/course-syllabus/course-syllabus.component';
import { DocenteSectionComponent, DocenteData } from '../../../shared/components/docente-section/docente-section.component';
import { CourseCtaComponent, CourseCtaData } from '../../../shared/components/course-cta/course-cta.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface WorkshopBenefit {
  icon: string;
  label: string;
  title: string;
  description: string;
  items: string[];
}

interface WorkshopCourse {
  slug: string;
  title: string;
  fullName: string;
  price: number;
  duration: string;
  access: string;
  teacher: string;
  contact: string;
  heroDescription: string;
  heroImage: string;
  heroAlt: string;
  accessText: string;
  benefitsTitle: string;
  benefitsHighlight: string;
  benefitsIntro: string;
  benefits: WorkshopBenefit[];
  sliderImages: string[];
  audienceIntro: string;
  syllabusData: SyllabusPhase[];
  journeySteps: Array<{
    shortTitle: string;
    period: string;
    icon: string;
    title: string;
    description: string;
    outcomes: string[];
  }>;
}

@Component({
  selector: 'app-seminario-reflexologia-online',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './seminario-reflexologia-online.component.html',
  styleUrls: ['./seminario-reflexologia-online.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SeminarioReflexologiaOnlineComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  showBenefitLightbox = false;
  benefitLightboxImage = '';

  readonly course: WorkshopCourse = {
    slug: 'seminario-reflexologia-online',
    title: 'Reflexología Podal',
    fullName: 'Seminario de Reflexología Podal (Online)',
    price: 150,
    duration: '1 mes / En vivo',
    access: 'Clases en vivo y grabadas',
    teacher: 'Lic. Lázaro Regalado Ponte',
    contact: '+51 939 371 250 / ecabanillasbardales@gmail.com',
    heroDescription: 'Convierte la reflexología en una herramienta terapéutica efectiva y aprende a abordar diferentes alteraciones mediante técnicas basadas en la Medicina Tradicional China.',
    heroImage: 'assets/seminario_reflexologia_curso.jpg',
    heroAlt: 'Seminario de Reflexología Podal Online',
    accessText: 'Estudia 100% online con clases en vivo y acompañamiento docente.',
    benefitsTitle: 'Todo lo necesario para iniciar en',
    benefitsHighlight: 'reflexología clínica.',
    benefitsIntro: 'Aprende las técnicas, localización de zonas reflejas y abordajes terapéuticos de manera ordenada y basada en casos clínicos reales.',
    benefits: [
      {
        icon: 'footprint',
        label: 'Zonas Reflejas',
        title: 'Localiza las principales zonas del pie.',
        description: 'Aprende la localización precisa de las principales zonas reflejas del pie y su correspondencia con los órganos y sistemas del cuerpo.',
        items: ['Localización precisa', 'Correspondencia de órganos y sistemas']
      },
      {
        icon: 'touch_app',
        label: 'Técnicas Clínicas',
        title: 'Domina las maniobras terapéuticas.',
        description: 'Aplica técnicas específicas de presión y manipulación podal con un enfoque terapéutico adaptado a cada patología.',
        items: ['Técnicas de presión y deslizamiento', 'Protocolos prácticos aplicados']
      },
      {
        icon: 'workspace_premium',
        label: 'Integración',
        title: 'Integración con Acupuntura.',
        description: 'Conoce técnicas de acupuntura aplicadas en pacientes reales, comprendiendo el razonamiento clínico profundo y su aplicación práctica.',
        items: ['Razonamiento clínico y terapéutico', 'Práctica guiada en pacientes reales']
      }
    ],
    sliderImages: [
      'assets/reflexologia_1.jpg',
      'assets/reflexologia_2.jpg',
      'assets/reflexologia_3.jpg'
    ],
    audienceIntro: 'Dirigido a estudiantes y profesionales de la salud, terapeutas y público interesado en las terapias integrales.',
    syllabusData: [
      {
        id: 'fase1',
        tabLabel: '01 · Fundamentos y Zonas',
        title: 'Fase 1: Bases de la Reflexología Podal y Medicina Tradicional China',
        description: 'Conoce los fundamentos científicos y energéticos de la reflexología, la localización precisa de las zonas reflejas del pie y su correspondencia con los sistemas orgánicos.',
        image: 'assets/plan_estudios_reflexologia1.jpg',
        imageAlt: 'Fundamentos de reflexología',
        specimenLabel: 'SEMINARIO // MAPA REFLEJO',
        items: [
          { number: '01', title: 'Introducción a la Reflexología Podal', badge1: 'Teoría', badge2: 'Sesión 1', description: 'Historia, bases filosóficas y fundamentos científicos de la reflexología podal y su relación con la Medicina Tradicional China.' },
          { number: '02', title: 'Zonas Reflejas del Pie', badge1: 'Anatomía', badge2: 'Sesión 1', description: 'Localización precisa de las principales zonas reflejas del pie: cabeza, órganos torácicos, abdominales y extremidades.' },
          { number: '03', title: 'Principios de la MTC aplicados', badge1: 'MTC', badge2: 'Sesión 2', description: 'Aplicación de los principios de Yin-Yang, 5 Elementos y el flujo de Qi en el contexto de la reflexología podal.' },
          { number: '04', title: 'Evaluación Reflexológica', badge1: 'Práctica', badge2: 'Sesión 2', description: 'Cómo realizar una evaluación inicial del paciente, identificar zonas sensibles y planificar el abordaje terapéutico.' }
        ]
      },
      {
        id: 'fase2',
        tabLabel: '02 · Técnicas y Práctica',
        title: 'Fase 2: Técnicas de Aplicación Terapéutica y Casos Clínicos',
        description: 'Aprende las técnicas específicas de presión y manipulación podal, y diseña protocolos personalizados para el tratamiento de diversas patologías basados en casos reales.',
        image: 'assets/plan_estudios_reflexologia2.jpg',
        imageAlt: 'Técnicas de reflexología y casos clínicos',
        specimenLabel: 'SEMINARIO // CLÍNICA',
        items: [
          { number: '01', title: 'Técnicas de Reflexología Podal', badge1: 'Práctica', badge2: 'Sesión 3', description: 'Técnicas de presión, deslizamiento y rotación aplicadas sobre las zonas reflejas con enfoque terapéutico.' },
          { number: '02', title: 'Protocolos para Patologías Frecuentes', badge1: 'Protocolos', badge2: 'Sesión 3', description: 'Diseño de protocolos específicos para cefaleas, problemas digestivos, insomnio, estrés y dolores musculares.' },
          { number: '03', title: 'Abordaje de Casos Clínicos', badge1: 'Casos', badge2: 'Sesión 4', description: 'Evaluación y resolución de casos clínicos reales: razonamiento terapéutico y adaptación del protocolo al paciente.' },
          { number: '04', title: 'Integración con Acupuntura', badge1: 'Integración', badge2: 'Sesión 4', description: 'Técnicas de acupuntura aplicadas en pacientes reales como complemento de la reflexología, con razonamiento clínico profundo.' }
        ]
      }
    ],
    journeySteps: [
      {
        shortTitle: 'Base',
        period: 'Inicio',
        icon: 'self_improvement',
        title: 'Bases de la Reflexología Podal',
        description: 'Ordena conceptos, localización de zonas reflejas principales y criterios de seguridad clínica.',
        outcomes: ['Base clara', 'Criterios de seguridad', 'Zonas reflejas principales']
      },
      {
        shortTitle: 'Técnica',
        period: 'Práctica',
        icon: 'touch_app',
        title: 'Aplica técnicas con una secuencia clínica clara',
        description: 'Aprende maniobras de presión, deslizamiento y rotación aplicadas a patologías frecuentes.',
        outcomes: ['Secuencia práctica', 'Abordaje de patologías', 'Técnicas terapéuticas']
      },
      {
        shortTitle: 'Uso',
        period: 'Integración',
        icon: 'workspace_premium',
        title: 'Integra con principios de Acupuntura',
        description: 'Observa y comprende la aplicación clínica de la acupuntura en casos reales bajo supervisión.',
        outcomes: ['Casos reales de acupuntura', 'Razonamiento terapéutico', 'Certificado oficial de participación']
      }
    ]
  };

  constructor(
    private readonly host: ElementRef<HTMLElement>,
    private readonly route: ActivatedRoute
  ) { }

  get journeySteps() {
    return this.course.journeySteps;
  }

  get syllabusData(): SyllabusPhase[] {
    return this.course.syllabusData;
  }

  get whatsappLink(): string {
    return `https://wa.me/51939371250?text=${encodeURIComponent(`Hola, deseo información sobre el ${this.course.fullName}`)}`;
  }

  get docenteData(): DocenteData {
    return {
      nombre: 'Lic. Lázaro Regalado Ponte',
      cargo: 'Docente Internacional de Medicina Tradicional China',
      biografia: 'Egresado de la <strong>Universidad de La Habana (Cuba)</strong>. Cuenta con <strong>más de 20 años de experiencia</strong> en la práctica y enseñanza de múltiples sistemas de Acupuntura, formando profesionales y terapeutas en diversos países. Su trayectoria combina sólidos conocimientos académicos con una amplia experiencia clínica, brindando a sus alumnos una formación basada en casos reales, razonamiento terapéutico y técnicas de alto nivel.',
      fotoUrl: 'assets/Lic Lazaro.jpg',
      kicker: 'PONENTE INTERNACIONAL',
      especialidades: [
        { icon: 'public', label: 'Ponente Internacional' },
        { icon: 'school', label: 'Egresado Univ. de La Habana' },
        { icon: 'verified', label: 'Más de 20 años de experiencia' }
      ]
    };
  }

  get secondaryDocenteData(): DocenteData | undefined {
    return undefined;
  }

  get ctaData(): CourseCtaData {
    return {
      precio: this.course.price,
      cuotasInfo: `${this.course.duration} · Online · Certificado incluido`,
      plazasDisponibles: 10,
      whatsappLink: this.whatsappLink,
      email: 'ecabanillasbardales@gmail.com',
      beneficios: [
        'Seminario de Reflexología Podal (Online)',
        'Inversión única: S/ 150.00',
        'Incluye certificado de participación',
        'Modalidad 100% Online (Clases en vivo)',
        'Acompañamiento docente y casos clínicos',
        'Integración con principios de acupuntura'
      ],
      headlineHtml: '¡Especialízate en Reflexología Podal con un enfoque clínico!',
      description: 'Aprende a abordar diferentes alteraciones mediante técnicas basadas en la Medicina Tradicional China, con la experiencia del Lic. Lázaro Regalado Ponte.',
      faqs: [
        { icon: 'help', pregunta: '¿Cómo son las clases?', respuesta: 'Las clases son 100% online en vivo con acompañamiento del docente y acceso a las grabaciones.' },
        { icon: 'payments', pregunta: '¿Cuál es la inversión?', respuesta: 'La inversión única es de S/ 150.00 e incluye constancia o certificado de participación.' },
        { icon: 'verified', pregunta: '¿Incluye certificado?', respuesta: 'Sí, recibirás un certificado de participación oficial emitido por Plataforma LMS.' },
        { icon: 'support_agent', pregunta: '¿Cómo me inscribo?', respuesta: 'Puedes realizar tu inscripción comunicándote directamente a nuestro WhatsApp o correo electrónico.' }
      ],
      trustText: 'Pago seguro · Respaldo institucional Plataforma LMS · Ponente Internacional de primer nivel'
    };
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
    this.activeBenefitIndex = (this.activeBenefitIndex + 1) % 3;
  }

  setBenefit(i: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }

  openBenefitLightbox(): void {
    this.benefitLightboxImage = this.course.sliderImages[this.activeBenefitIndex];
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
    gsap.registerPlugin(ScrollTrigger);

    this.animationContext = gsap.context(() => {
      gsap.from('.ac-kicker', { opacity: 0, y: 14, duration: 0.45, ease: 'power3.out' });
      gsap.from('.ac-title', { opacity: 0, y: 28, duration: 0.65, delay: 0.08, ease: 'power3.out' });
      gsap.from('.ac-description, .ac-actions, .ac-proof', { opacity: 0, y: 18, duration: 0.55, delay: 0.18, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.ac-hero__visual', { opacity: 0, scale: 0.94, duration: 0.75, delay: 0.2, ease: 'power3.out' });
      gsap.from('.ac-fact', { opacity: 0, y: 20, duration: 0.48, delay: 0.4, stagger: 0.06, ease: 'power3.out' });

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
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
