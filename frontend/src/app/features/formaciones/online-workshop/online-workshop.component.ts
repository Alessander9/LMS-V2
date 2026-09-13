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
  priceDetail?: string;
  duration: string;
  durationDetail?: string;
  modalityLabel?: string;
  modalityDetail?: string;
  access: string;
  accessTitle?: string;
  accessSubtext?: string;
  accessHeading?: string;
  teacher: string;
  contact: string;
  heroKicker?: string;
  heroKickerTag?: string;
  heroBadgeLabel?: string;
  visualCardBottomTitle?: string;
  visualCardBottomSub?: string;
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

const baseImages = {
  acupuncture: 'assets/AcupunturaChinaplataforma_lms.jpg',
  acupuncture2: 'assets/Acupunturaplataforma_lms2.jpg',
  acupuncture3: 'assets/Acupunturaplataforma_lms3.jpg',
  acupuncture4: 'assets/Acupunturaplataforma_lms4.jpg',
  auriculo: 'assets/Auriculoterapia plataforma_lms.jpg',
  masaje: 'assets/MasajeDigitoPresionplataforma_lms.jpg',
  stretching: 'assets/curso_masaje.jpg',
  learning: 'assets/hero_learning.png'
};

const courses: Record<string, WorkshopCourse> = {
  'reflexologia-online': {
    slug: 'reflexologia-online',
    title: 'Reflexologia',
    fullName: 'Curso de Reflexologia',
    price: 120,
    duration: '2 horas',
    access: '12 meses',
    teacher: 'Consultar',
    contact: '+51 939 371 250 / ecabanillasbardales@gmail.com',
    heroDescription: 'Curso online de <strong>reflexologia aplicada</strong> para aprender una base clara, ordenada y lista para integrar a sesiones de bienestar.',
    heroImage: 'assets/reflexologia_img_curso.jpg',
    heroAlt: 'Curso de reflexologia online Plataforma LMS',
    accessText: 'Disponible de inmediato con acceso durante 12 meses.',
    benefitsTitle: 'Todo lo necesario para iniciar en',
    benefitsHighlight: 'reflexologia.',
    benefitsIntro: 'Una ruta corta, clara y aplicable para entender zonas reflejas y organizar una sesion desde cero.',
    benefits: [
      { icon: 'footprint', label: 'Base refleja', title: 'Comprende las zonas reflejas principales.', description: 'Aprende el mapa basico de reflexologia y su relacion con el bienestar general.', items: ['Zonas reflejas principales', 'Criterio de aplicacion segura'] },
      { icon: 'touch_app', label: 'Tecnica guiada', title: 'Aplica maniobras con orden y seguridad.', description: 'Organiza una sesion breve con secuencia clara, presion adecuada y objetivos concretos.', items: ['Secuencia practica', 'Presion y ritmo de trabajo'] },
      { icon: 'workspace_premium', label: 'Aplicacion', title: 'Integra el contenido a tu practica.', description: 'Usa lo aprendido como complemento para sesiones de bienestar y atencion integral.', items: ['Aplicacion inmediata', 'Acceso por 12 meses'] }
    ],
    sliderImages: [
      'assets/formacion_online_reflexologia1.jpg',
      'assets/formacion_online_reflexologia2.jpg',
      'assets/formacion_online_reflexologia3.jpg'
    ],
    audienceIntro: 'Dirigido a profesionales y estudiantes que quieren aplicar el contenido con una base clara y ordenada.',
    syllabusData: [
      {
        id: 'fase1', tabLabel: '01 · Fundamentos', title: 'Fundamentos de Reflexologia', description: 'Principios, zonas reflejas y criterios basicos para una practica segura.', image: 'assets/plan_estudios_reflexologia_1.jpg', imageAlt: 'Fundamentos de reflexologia', specimenLabel: 'SPECIMEN // MAPA REFLEJO', items: [
          { number: '01', title: 'Mapa reflejo', badge1: 'Base', badge2: 'Teoria', description: 'Reconocimiento de zonas reflejas principales y su lectura general.' },
          { number: '02', title: 'Preparacion', badge1: 'Sesion', badge2: 'Orden', description: 'Organizacion del espacio, higiene, postura y comunicacion con el consultante.' }
        ]
      },
      {
        id: 'fase2', tabLabel: '02 · Aplicacion', title: 'Aplicacion Practica', description: 'Secuencia breve de trabajo y recomendaciones para integrar el contenido.', image: 'assets/plan_estudios_reflexologia_1.jpg', imageAlt: 'Aplicacion de reflexologia', specimenLabel: 'SPECIMEN // SECUENCIA PRACTICA', items: [
          { number: '01', title: 'Maniobras', badge1: 'Practica', badge2: 'Tecnica', description: 'Presion, ritmo y direccion de maniobras basicas.' },
          { number: '02', title: 'Integracion', badge1: 'Consulta', badge2: 'Uso', description: 'Como integrar la reflexologia como recurso complementario.' }
        ]
      }
    ],
    journeySteps: []
  },
  'acupuntura-estetica-online': {
    slug: 'acupuntura-estetica-online',
    title: 'Acupuntura Estetica',
    fullName: 'Taller de Acupuntura Estetica',
    price: 90,
    duration: '2 horas',
    access: '12 meses',
    teacher: 'Lic. Lazaro Regalado Ponte',
    contact: '+51 939 371 250',
    heroDescription: 'Taller online de <strong>acupuntura estetica</strong> para conocer protocolos faciales, criterio de aplicacion y enfoque profesional.',
    heroImage: 'assets/estetica_virtual_img_curso.jpg',
    heroAlt: 'Taller de acupuntura estetica online',
    accessText: 'Disponible de inmediato para estudiar a tu ritmo.',
    benefitsTitle: 'Todo lo necesario para aplicar',
    benefitsHighlight: 'acupuntura estetica.',
    benefitsIntro: 'Un taller directo para comprender objetivos esteticos, seleccion de puntos y seguridad terapeutica.',
    benefits: [
      { icon: 'face_retouching_natural', label: 'Enfoque facial', title: 'Comprende objetivos esteticos reales.', description: 'Identifica necesidades frecuentes y el rol de la acupuntura dentro del cuidado facial.', items: ['Criterio estetico', 'Objetivos por protocolo'] },
      { icon: 'adjust', label: 'Protocolos', title: 'Aprende combinaciones de puntos.', description: 'Revisa abordajes practicos para tonicidad, circulacion y bienestar facial.', items: ['Seleccion de puntos', 'Secuencia de trabajo'] },
      { icon: 'verified', label: 'Seguridad', title: 'Aplica con cuidado profesional.', description: 'Integra recomendaciones, contraindicaciones y comunicacion con el paciente.', items: ['Cuidados basicos', 'Aplicacion responsable'] }
    ],
    sliderImages: [
      'assets/formacion_estetica1.jpg',
      'assets/formacion_estetica1.jpg',
      'assets/formacion_estetica1.jpg'
    ],
    audienceIntro: 'Ideal para terapeutas, estudiantes y profesionales que desean sumar una herramienta estetica complementaria.',
    syllabusData: [
      {
        id: 'fase1', tabLabel: '01 · Bases esteticas', title: 'Bases de Acupuntura Estetica', description: 'Fundamentos del abordaje facial y objetivos terapeutico-esteticos.', image: 'assets/plan_estudios_estetica_1.jpg', imageAlt: 'Bases de acupuntura estetica', specimenLabel: 'SPECIMEN // ACUPUNTURA ESTETICA', items: [
          { number: '01', title: 'Criterio facial', badge1: 'Base', badge2: 'Estetica', description: 'Lectura inicial de necesidades y objetivos esteticos frecuentes.' },
          { number: '02', title: 'Seguridad', badge1: 'Practica', badge2: 'Cuidado', description: 'Indicaciones, cuidados y limites de aplicacion.' }
        ]
      },
      {
        id: 'fase2', tabLabel: '02 · Protocolos', title: 'Protocolos de Aplicacion', description: 'Secuencias y puntos principales para integrar a una sesion estetica.', image: 'assets/plan_estudios_estetica_2.jpg', imageAlt: 'Protocolos de acupuntura estetica', specimenLabel: 'SPECIMEN // PROTOCOLOS FACIALES', items: [
          { number: '01', title: 'Puntos clave', badge1: 'Tecnica', badge2: 'Puntos', description: 'Seleccion y combinacion de puntos orientados al trabajo facial.' },
          { number: '02', title: 'Sesion', badge1: 'Orden', badge2: 'Aplicacion', description: 'Estructura breve de una sesion con enfoque estetico.' }
        ]
      }
    ],
    journeySteps: []
  },
  'stretching-terapeutico-online': {
    slug: 'stretching-terapeutico-online',
    title: 'Stretching Terapeutico',
    fullName: 'Taller de Stretching Terapeutico',
    price: 90,
    duration: '2 horas',
    access: '12 meses',
    teacher: 'Emanuel Cabanillas B.',
    contact: '+51 939 371 250',
    heroDescription: 'Taller online de <strong>stretching terapeutico</strong> para aplicar movilidad, elongacion y criterios de cuidado corporal.',
    heroImage: 'assets/img_curso_stretching_online.jpg',
    heroAlt: 'Taller de stretching terapeutico online',
    accessText: 'Disponible de inmediato para estudiar y practicar a tu ritmo.',
    benefitsTitle: 'Todo lo necesario para aplicar',
    benefitsHighlight: 'stretching terapeutico.',
    benefitsIntro: 'Una formacion breve para ordenar tecnicas de movilidad, elongacion y progresion segura.',
    benefits: [
      { icon: 'self_improvement', label: 'Movilidad', title: 'Mejora rango y control corporal.', description: 'Comprende principios de movilidad y elongacion con sentido terapeutico.', items: ['Movilidad funcional', 'Rangos seguros'] },
      { icon: 'accessibility_new', label: 'Tecnica', title: 'Aplica estiramientos con criterio.', description: 'Organiza ejercicios segun objetivo, tension muscular y tolerancia de la persona.', items: ['Secuencia guiada', 'Adaptaciones basicas'] },
      { icon: 'health_and_safety', label: 'Bienestar', title: 'Integra rutinas utiles y seguras.', description: 'Usa protocolos simples para complementar atencion corporal y autocuidado.', items: ['Rutinas aplicables', 'Prevencion de molestias'] }
    ],
    sliderImages: [
      'assets/formacion_stretching_online1.jpg',
      'assets/formacion_stretching_online2.jpg',
      'assets/formacion_stretching_online3.jpg'
    ],
    audienceIntro: 'Dirigido a estudiantes, terapeutas y profesionales del movimiento que desean aplicar stretching con orden.',
    syllabusData: [
      {
        id: 'fase1', tabLabel: '01 · Fundamentos', title: 'Bases de Stretching Terapeutico', description: 'Principios de movilidad, elongacion y progresion segura.', image: 'assets/stretching_plan_estudios1.jpg', imageAlt: 'Fundamentos de stretching terapeutico', specimenLabel: 'SPECIMEN // MOVILIDAD Y ELONGACION', items: [
          { number: '01', title: 'Movilidad', badge1: 'Base', badge2: 'Control', description: 'Conceptos de rango, tension y adaptacion corporal.' },
          { number: '02', title: 'Seguridad', badge1: 'Cuidado', badge2: 'Progresion', description: 'Como ajustar intensidad y evitar molestias innecesarias.' }
        ]
      },
      {
        id: 'fase2', tabLabel: '02 · Rutinas', title: 'Rutinas y Aplicacion', description: 'Secuencias practicas para aplicar en bienestar y cuidado corporal.', image: 'assets/stretching_plan_estudios2.jpg', imageAlt: 'Rutinas de stretching terapeutico', specimenLabel: 'SPECIMEN // SECUENCIAS PRACTICAS', items: [
          { number: '01', title: 'Secuencias', badge1: 'Practica', badge2: 'Rutina', description: 'Orden de ejercicios para zonas frecuentes de tension.' },
          { number: '02', title: 'Integracion', badge1: 'Uso', badge2: 'Bienestar', description: 'Como sumar stretching a una sesion o rutina personal.' }
        ]
      }
    ],
    journeySteps: []
  },
  'paralisis-facial-acupuntura-fisioterapia-online': {
    slug: 'paralisis-facial-acupuntura-fisioterapia-online',
    title: 'Paralisis Facial con Acupuntura y Fisioterapia',
    fullName: 'Taller Paralisis Facial con Acupuntura y Fisioterapia',
    price: 120,
    duration: '2 horas',
    access: '12 meses',
    teacher: 'Lazaro Regalado Ponte',
    contact: '+51 939 371 250',
    heroDescription: 'Taller online para abordar <strong>paralisis facial</strong> integrando acupuntura, fisioterapia y criterio clinico complementario.',
    heroImage: 'assets/paralisis_facial_img_curso.jpg',
    heroAlt: 'Taller de paralisis facial con acupuntura y fisioterapia',
    accessText: 'Disponible de inmediato con enfoque clinico aplicado.',
    benefitsTitle: 'Todo lo necesario para abordar',
    benefitsHighlight: 'paralisis facial.',
    benefitsIntro: 'Un taller directo para comprender evaluacion, objetivos y recursos terapeuticos integrados.',
    benefits: [
      { icon: 'neurology', label: 'Evaluacion', title: 'Comprende el cuadro y sus objetivos.', description: 'Ordena criterios para interpretar necesidades frecuentes en paralisis facial.', items: ['Lectura inicial', 'Objetivos terapeuticos'] },
      { icon: 'adjust', label: 'Acupuntura', title: 'Integra puntos y estimulos utiles.', description: 'Revisa criterios de seleccion de puntos y abordaje complementario.', items: ['Puntos clave', 'Criterio de estimulo'] },
      { icon: 'physical_therapy', label: 'Fisioterapia', title: 'Complementa con recursos funcionales.', description: 'Integra ejercicios, pautas y recomendaciones para acompanamiento terapeutico.', items: ['Ejercicios guiados', 'Seguimiento practico'] }
    ],
    sliderImages: [
      'assets/paralisis_facial_img_temario1.jpg',
      'assets/paralisis_facial_img_temario2.jpg',
      'assets/paralisis_facial_img_temario3.jpg'
    ],
    audienceIntro: 'Pensado para profesionales y estudiantes que buscan una vision integrada entre acupuntura y fisioterapia.',
    syllabusData: [
      {
        id: 'fase1', tabLabel: '01 · Evaluacion', title: 'Evaluacion y Criterio Clinico', description: 'Bases para comprender paralisis facial y objetivos de intervencion.', image: 'assets/paralisis_estudiar1.jpg', imageAlt: 'Evaluacion en paralisis facial', specimenLabel: 'SPECIMEN // EVALUACION CLINICA', items: [
          { number: '01', title: 'Cuadro clinico', badge1: 'Base', badge2: 'Clinica', description: 'Reconocimiento de signos, necesidades y objetivos terapeuticos.' },
          { number: '02', title: 'Plan', badge1: 'Orden', badge2: 'Ruta', description: 'Organizacion de prioridades para una intervencion complementaria.' }
        ]
      },
      {
        id: 'fase2', tabLabel: '02 · Intervencion', title: 'Acupuntura y Fisioterapia', description: 'Recursos practicos para acompanar la recuperacion funcional.', image: 'assets/paralisis_estudiar2.jpg', imageAlt: 'Intervencion en paralisis facial', specimenLabel: 'SPECIMEN // RECURSOS TERAPEUTICOS', items: [
          { number: '01', title: 'Acupuntura', badge1: 'Puntos', badge2: 'Tecnica', description: 'Criterio de puntos y estimulos complementarios.' },
          { number: '02', title: 'Ejercicio', badge1: 'Funcion', badge2: 'Practica', description: 'Pautas funcionales y recomendaciones de seguimiento.' }
        ]
      }
    ],
    journeySteps: []
  },
  'control-peso-auriculoterapia-acupuntura-online': {
    slug: 'control-peso-auriculoterapia-acupuntura-online',
    title: 'Seminario Internacional de Auriculoterapia',
    fullName: 'Seminario Internacional de Auriculoterapia',
    price: 280,
    priceDetail: '+ S/ 30 inscripción · Incluye Kit',
    duration: '4 sesiones Zoom + Prácticas presenciales',
    durationDetail: 'Virtual: 7-9 p.m. | Prácticas: 10 a.m.-5 p.m.',
    modalityLabel: 'Híbrido (Zoom + Presencial)',
    modalityDetail: 'En vivo y prácticas guiadas',
    access: 'Miércoles 2 de Septiembre',
    accessTitle: 'Inicio',
    accessSubtext: 'Prácticas: 27 y 28 Sep',
    accessHeading: 'Fechas y horarios',
    teacher: 'Lic. Lázaro Regalado Potente',
    contact: '+51 939 371 250 / ecabanillasbardales@gmail.com',
    heroKicker: 'Inicio: Miércoles 2 de Septiembre',
    heroKickerTag: 'Seminario Internacional',
    heroBadgeLabel: 'Seminario Internacional Plataforma LMS',
    visualCardBottomTitle: 'Modalidad Híbrida',
    visualCardBottomSub: 'Zoom + Prácticas Presenciales',
    heroDescription: 'Seminario internacional de <strong>Auriculoterapia</strong> con modalidad virtual vía Zoom (4 sesiones en vivo) y prácticas presenciales intensivas. Con los ponentes <strong>Lic. Lázaro Regalado Potente (Cuba)</strong> y <strong>Emanuel Cabanillas Bardales (Perú)</strong>. Organizado por Plataforma LMS con el respaldo de <strong>Amazoni-k</strong>.',
    heroImage: 'assets/curso_int_queda.jpg',
    heroAlt: 'Seminario Internacional de Auriculoterapia - Plataforma LMS',
    accessText: 'Virtual vía Zoom: Miércoles 2 de Septiembre (7:00 a 9:00 p.m.) · Prácticas presenciales: 27 y 28 de Septiembre (10:00 a.m. a 5:00 p.m.).',
    benefitsTitle: 'Formación internacional con',
    benefitsHighlight: 'práctica clínica y kit asegurado.',
    benefitsIntro: 'Estructura integral que combina teoría en vivo por Zoom, entrenamiento práctico presencial intensivo y materiales profesionales asegurados.',
    benefits: [
      {
        icon: 'laptop_chromebook',
        label: '01 · Clases Virtuales (Zoom)',
        title: '4 sesiones en vivo (7:00 a 9:00 p.m.)',
        description: 'Inicio el Miércoles 2 de septiembre vía Zoom. Anatomía del pabellón auricular, cartografía, puntos maestros y protocolos clínicos.',
        items: ['4 sesiones interactivas en tiempo real', 'Horario: 7:00 p.m. a 9:00 p.m.', 'Acceso a grabaciones y material de consulta']
      },
      {
        icon: 'pan_tool',
        label: '02 · Prácticas Presenciales',
        title: '27 y 28 de septiembre (10:00 a.m. a 5:00 p.m.)',
        description: 'Jornadas completas de entrenamiento presencial para perfeccionar localización de puntos, palpación y técnicas de colocación.',
        items: ['2 días intensivos de 10:00 a.m. a 5:00 p.m.', 'Entrenamiento clínico supervisado en vivo', 'Corrección de técnica y resolución de casos']
      },
      {
        icon: 'card_giftcard',
        label: '03 · Beneficio y Respaldo',
        title: 'Kit de Auriculoterapia asegurado y certificación',
        description: 'Te aseguras tu kit completo para comenzar a aplicar lo aprendido. Evento organizado por Plataforma LMS con el respaldo de Amazoni-k.',
        items: ['Kit de auriculoterapia asegurado', 'Auspicio: Amazoni-k (agujasacupunturaperu.com)', 'Constancia / Certificación otorgada por Plataforma LMS']
      }
    ],
    sliderImages: [
      'assets/formacion_1.jpg',
      'assets/formacion_2.jpg',
      'assets/formacion_3.jpg'
    ],
    audienceIntro: 'Dirigido a fisioterapeutas, acupuntores, terapeutas integrales, profesionales de la salud y alumnos que desean dominar la auriculoterapia con ponentes de Cuba y Perú.',
    syllabusData: [
      {
        id: 'fase1',
        tabLabel: '01 · Clases Virtuales (Zoom)',
        title: 'Fundamentos, Cartografía y Protocolos',
        description: '4 sesiones en vivo (7:00 p.m. a 9:00 p.m.) iniciando el miércoles 2 de septiembre.',
        image: 'assets/plan_1.jpg',
        imageAlt: 'Clases virtuales de auriculoterapia en vivo',
        specimenLabel: 'SPECIMEN // MÓDULO ZOOM EN VIVO',
        items: [
          { number: '01', title: 'Cartografía y Puntos Auriculares', badge1: 'Zoom', badge2: 'Teoría', description: 'Zonas reflejas del pabellón auricular, puntos maestros y vías reflejas.' },
          { number: '02', title: 'Diagnóstico y Protocolos Clínicos', badge1: 'En vivo', badge2: 'Protocolos', description: 'Protocolos para dolor, ansiedad, estrés, control de peso y alteraciones funcionales.' }
        ]
      },
      {
        id: 'fase2',
        tabLabel: '02 · Prácticas Presenciales',
        title: 'Taller Clínico Presencial Intensivo',
        description: '27 y 28 de septiembre (10:00 a.m. a 5:00 p.m.) con práctica directa y supervisión en vivo.',
        image: 'assets/plan_2.jpg',
        imageAlt: 'Práctica presencial de auriculoterapia',
        specimenLabel: 'SPECIMEN // PRÁCTICA PRESENCIAL',
        items: [
          { number: '01', title: 'Técnicas de Detección y Estimulación', badge1: 'Presencial', badge2: 'Práctica', description: 'Manejo del palpador, punción con agujas, semillas de vaccaria, balines y chinchetas.' },
          { number: '02', title: 'Casos Reales y Evaluación Guiada', badge1: '10am-5pm', badge2: 'Taller', description: 'Aplicación en casos reales con retroalimentación inmediata de los ponentes.' }
        ]
      }
    ],
    journeySteps: []
  }
};

function buildJourney(course: WorkshopCourse): WorkshopCourse['journeySteps'] {
  return [
    {
      shortTitle: 'Base',
      period: 'Inicio',
      icon: 'neurology',
      title: `Comprende la base de ${course.title}`,
      description: 'Ordena conceptos, objetivos y criterios principales antes de pasar a la aplicacion.',
      outcomes: ['Base clara', 'Criterios de seguridad', 'Objetivos de aprendizaje']
    },
    {
      shortTitle: 'Tecnica',
      period: 'Practica',
      icon: 'medical_services',
      title: 'Aplica tecnicas con una secuencia clara',
      description: 'Revisa pasos, recomendaciones y recursos para aplicar el contenido de forma ordenada.',
      outcomes: ['Secuencia practica', 'Protocolos simples', 'Aplicacion guiada']
    },
    {
      shortTitle: 'Uso',
      period: 'Integracion',
      icon: 'workspace_premium',
      title: 'Integra lo aprendido a tu practica',
      description: 'Consolida lo aprendido y define como usarlo en sesiones, estudio o desarrollo profesional.',
      outcomes: ['Uso profesional', 'Acceso extendido', 'Constancia Plataforma LMS']
    }
  ];
}

Object.values(courses).forEach(course => {
  course.journeySteps = buildJourney(course);
});

@Component({
  selector: 'app-online-workshop',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './online-workshop.component.html',
  styleUrls: ['./online-workshop.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OnlineWorkshopComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  course: WorkshopCourse = courses['reflexologia-online'];

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
    return `https://wa.me/51939371250?text=${encodeURIComponent(`Hola, deseo informacion sobre el ${this.course.fullName}`)}`;
  }

  get docenteData(): DocenteData {
    if (this.course.slug === 'control-peso-auriculoterapia-acupuntura-online') {
      return {
        nombre: 'Lic. Lázaro Regalado Potente',
        cargo: 'Ponente Internacional (Cuba)',
        biografia: 'Ponente internacional procedente de <strong>Cuba</strong>, especialista en medicina tradicional china, acupuntura y auriculoterapia clínica, con amplia trayectoria internacional en docencia y atención terapéutica.',
        fotoUrl: 'assets/Lic Lazaro.jpg',
        kicker: 'PONENTE INTERNACIONAL · CUBA',
        especialidades: [
          { icon: 'public', label: '🇨🇺 Docente Internacional (Cuba)' },
          { icon: 'school', label: 'Especialista en Auriculoterapia' },
          { icon: 'verified', label: 'Medicina Tradicional China' }
        ]
      };
    }

    return {
      nombre: this.course.teacher,
      cargo: 'Docente del curso',
      biografia: this.course.slug === 'paralisis-facial-acupuntura-fisioterapia-online'
        ? 'Formacion a cargo de <span class="text-brand-blue font-semibold">Lazaro Regalado Ponte</span> y <span class="text-brand-blue font-semibold">Emanuel Cabanillas Bardales</span>, quienes integran acupuntura, fisioterapia y terapias manuales para brindar un curso practico, claro y aplicable desde la primera revision del contenido.'
        : this.course.teacher === 'Consultar'
          ? 'Docente asignado por <span class="text-brand-blue font-semibold">Plataforma LMS</span>. Solicita informacion para confirmar la disponibilidad academica y detalles del acompanamiento.'
          : `Formacion a cargo de <span class="text-brand-blue font-semibold">${this.course.teacher}</span>, con enfoque practico, claro y aplicable desde la primera revision del contenido.`,
      fotoUrl: ['acupuntura-estetica-online', 'control-peso-auriculoterapia-acupuntura-online', 'paralisis-facial-acupuntura-fisioterapia-online'].includes(this.course.slug)
        ? 'assets/Lic Lazaro.jpg'
        : 'assets/Lic Emanuel.jpg',
      kicker: 'DOCENCIA Plataforma LMS',
      especialidades: [
        { icon: 'verified', label: 'Enfoque practico' },
        { icon: 'school', label: 'Curso online' }
      ]
    };
  }

  get secondaryDocenteData(): DocenteData | undefined {
    if (this.course.slug === 'control-peso-auriculoterapia-acupuntura-online') {
      return {
        nombre: 'Emanuel Cabanillas Bardales',
        cargo: 'Fisioterapeuta & Acupuntor (Perú)',
        biografia: 'Docente y terapeuta de <strong>Perú</strong>, Fisioterapeuta & Acupuntor, director en <strong>Plataforma LMS</strong> (Instituto de Terapias Integrales Perú). Especialista en abordaje integral del dolor y terapias complementarias.',
        fotoUrl: 'assets/Lic Emanuel.jpg',
        kicker: 'PONENTE · PERÚ',
        especialidades: [
          { icon: 'flag', label: '🇵🇪 Fisioterapeuta & Acupuntor (Perú)' },
          { icon: 'apartment', label: 'Organiza: Plataforma LMS' },
          { icon: 'handshake', label: 'Aliado: Amazoni-k' }
        ]
      };
    }

    if (this.course.slug !== 'paralisis-facial-acupuntura-fisioterapia-online') {
      return undefined;
    }

    return {
      nombre: 'Emanuel Cabanillas Bardales',
      cargo: 'Docente del curso',
      biografia: 'Formacion a cargo de <span class="text-brand-blue font-semibold">Emanuel Cabanillas Bardales</span>, con enfoque practico en fisioterapia y terapias manuales.',
      fotoUrl: 'assets/Lic Emanuel.jpg',
      kicker: 'DOCENCIA Plataforma LMS',
      especialidades: [
        { icon: 'verified', label: 'Fisioterapia' },
        { icon: 'school', label: 'Curso online' }
      ]
    };
  }

  get ctaData(): CourseCtaData {
    if (this.course.slug === 'control-peso-auriculoterapia-acupuntura-online') {
      return {
        precio: 280,
        cuotasInfo: 'Inversión: S/ 280 · Inscripción: S/ 30 · Incluye Kit',
        plazasDisponibles: 12,
        whatsappLink: 'https://wa.me/51939371250?text=' + encodeURIComponent('Hola, deseo inscribirme en el Seminario Internacional de Auriculoterapia'),
        email: 'ecabanillasbardales@gmail.com',
        beneficios: [
          'Modalidad Virtual vía Zoom: 4 sesiones en vivo (7:00 p.m. a 9:00 p.m.)',
          'Prácticas Presenciales: 27 y 28 de septiembre (10:00 a.m. a 5:00 p.m.)',
          'Te aseguras un Kit de Auriculoterapia completo',
          'Ponentes: Lic. Lázaro Regalado Potente (Cuba) y Emanuel Cabanillas Bardales (Perú)',
          'Organiza Plataforma LMS con el respaldo de Amazoni-k (www.agujasacupunturaperu.com)'
        ],
        headlineHtml: `Inscríbete hoy en el<br><span class="text-secondary">${this.course.title}</span>.`,
        description: 'Seminario Internacional con 4 sesiones virtuales en vivo por Zoom, prácticas presenciales intensivas y kit de auriculoterapia asegurado.',
        faqs: [
          { icon: 'calendar_month', pregunta: '¿Cuáles son las fechas y horarios?', respuesta: 'Inicio virtual vía Zoom el Miércoles 2 de septiembre (4 sesiones en vivo de 7:00 p.m. a 9:00 p.m.). Prácticas presenciales el 27 y 28 de septiembre de 10:00 a.m. a 5:00 p.m.' },
          { icon: 'payments', pregunta: '¿Cuál es la inversión e inscripción?', respuesta: 'La inversión es de S/ 280 y la inscripción de S/ 30. Incluye todas las clases Zoom, prácticas presenciales y certificación.' },
          { icon: 'card_giftcard', pregunta: '¿Qué incluye el beneficio del kit?', respuesta: 'Te aseguras un kit completo de Auriculoterapia con materiales de calidad garantizada para tus prácticas y aplicaciones terapéuticas.' },
          { icon: 'public', pregunta: '¿Quiénes dictan el seminario?', respuesta: 'Ponente internacional: Lic. Lázaro Regalado Potente (Cuba) y Ponente nacional: Emanuel Cabanillas Bardales (Perú, Fisioterapeuta & Acupuntor).' },
          { icon: 'handshake', pregunta: '¿Quiénes organizan y respaldan?', respuesta: 'Organiza Plataforma LMS (Instituto de Terapias Integrales Perú) junto a su aliado y marca oficial Amazoni-k (www.agujasacupunturaperu.com).' }
        ],
        trustText: 'Organiza Plataforma LMS · Aliado: Amazoni-k · Kit Asegurado · Cupos Limitados'
      };
    }

    return {
      precio: this.course.price,
      cuotasInfo: `${this.course.duration} · Online · Acceso ${this.course.access}`,
      plazasDisponibles: 15,
      whatsappLink: 'https://wa.me/51939371250',
      email: 'ecabanillasbardales@gmail.com',
      beneficios: [
        `${this.course.fullName} disponible de inmediato`,
        `Duracion: ${this.course.duration}`,
        `Acceso: ${this.course.access}`,
        `Contacto: ${this.course.contact}`
      ],
      headlineHtml: `Inscribete hoy en<br><span class="text-secondary">${this.course.title}</span>.`,
      description: 'Accede a una formacion online breve, directa y pensada para aplicar con una base clara desde el primer dia.',
      faqs: [
        { icon: 'schedule', pregunta: '¿Cuando puedo empezar?', respuesta: 'El curso esta disponible de inmediato despues de la inscripcion.' },
        { icon: 'devices', pregunta: '¿La modalidad es online?', respuesta: 'Si. Puedes revisar el contenido desde el campus virtual.' },
        { icon: 'verified', pregunta: '¿Recibo constancia?', respuesta: 'Si. Plataforma LMS emite constancia o certificado segun las condiciones del curso.' },
        { icon: 'support_agent', pregunta: '¿Como consulto detalles?', respuesta: `Puedes escribir al ${this.course.contact}.` }
      ],
      trustText: 'Pago seguro · Acceso online · Asesoria personalizada antes de matricularte'
    };
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.routeConfig?.path?.replace('cursos/', '') || 'reflexologia-online';
    this.course = courses[slug] ?? courses['reflexologia-online'];
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
