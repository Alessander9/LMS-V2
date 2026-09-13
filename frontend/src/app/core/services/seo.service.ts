import { Injectable, inject, OnDestroy } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute, Data } from '@angular/router';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Subject, startWith } from 'rxjs';

export interface SeoData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: string;
  ogImageHeight?: string;
  ogImageAlt?: string;
  ogType?: string;
  ogLocale?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  keywords?: string;
  robots?: string;
}

const DEFAULT_SEO: SeoData = {
  title: 'Plataforma LMS — Instituto de Terapias Integrales | Cursos Online',
  description: 'Plataforma LMS es el instituto online líder en terapias complementarias en Perú. Más de 5,000 terapeutas certificados. Cursos de acupuntura, auriculoterapia, masaje terapéutico y más.',
  ogTitle: 'Plataforma LMS — Instituto de Terapias Integrales | Cursos Online',
  ogDescription: 'Aprende, certifícate y transforma tu carrera profesional. Más de 5,000 terapeutas ya confiaron en Plataforma LMS.',
  ogImage: 'https://Plataforma LMS.com/assets/og-default.svg',
  // ⚠️ Para producción: reemplazar por og-default.jpg (1200×630px) generado por diseñador.
  // SVG funciona en Facebook, Twitter y WhatsApp, pero JPEG tiene mejor compatibilidad.
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageAlt: 'Plataforma LMS — Instituto de Terapias Integrales',
  ogType: 'website',
  ogLocale: 'es_PE',
  twitterCard: 'summary_large_image',
  keywords: 'terapias integrales, cursos online, certificación, acupuntura, auriculoterapia, masaje terapéutico, Plataforma LMS, Perú',
  robots: 'index, follow'
};

/** Datos estructurados específicos por curso para JSON-LD */
const COURSE_JSONLD: Record<string, object> = {
  'acupuntura-china': {
    'name': 'Formación Profesional en Acupuntura China',
    'description': 'Programa anual completo de acupuntura china. 12 meses de formación híbrida con clases online en vivo y prácticas presenciales supervisadas. Incluye moxibustión, electroacupuntura y microsistemas.',
    'duration': 'P12M',
    'timeRequired': 'P12M',
    'offers': {
      '@type': 'Offer',
      'price': '290',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado Profesional en Acupuntura China – 240 horas',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Profesionales de la salud y terapeutas'
    }
  },
  'auriculoterapia': {
    'name': 'Curso Profesional de Auriculoterapia',
    'description': 'Curso presencial de auriculoterapia. 2 meses de formación intensiva con kit clínico y manual incluidos. Aprende somatotopía auricular y protocolos clínicos.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '260',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/LimitedAvailability',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado Profesional en Auriculoterapia',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Terapeutas y público general'
    }
  },
  'masaje-terapeutico': {
    'name': 'Formación Profesional en Masaje Terapéutico',
    'description': 'Curso profesional de masaje terapéutico y digitopresión. Aprende técnicas de masaje descontracturante, deportivo y terapia manual con certificación oficial.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado Profesional en Masaje Terapéutico',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Profesionales de la salud y terapeutas'
    }
  },
  'reflexologia-podal-presencial': {
    'name': 'Curso Presencial de Reflexología Podal',
    'description': 'Curso presencial de reflexología podal. Aprende técnicas de masaje reflejo en los pies para diagnóstico y tratamiento de desórdenes sistémicos.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado en Reflexología Podal',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Terapeutas y público general'
    }
  },
  'paralisis-facial-presencial': {
    'name': 'Curso Presencial de Parálisis Facial',
    'description': 'Curso presencial especializado en tratamiento de parálisis facial. Técnicas de medicina tradicional china y terapia manual.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado en Tratamiento de Parálisis Facial',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Profesionales de la salud'
    }
  },
  'moxibustion-ventosas-presencial': {
    'name': 'Curso Presencial de Moxibustión y Ventosas',
    'description': 'Curso presencial de moxibustión y ventosas. Aprende técnicas de calentamiento terapéutico y liberación miofascial.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado en Moxibustión y Ventosas'
  },
  'acupuntura-estetica-presencial': {
    'name': 'Curso Presencial de Acupuntura Estética',
    'description': 'Curso presencial de acupuntura estética. Aprende técnicas de rejuvenecimiento facial y corporal con acupuntura.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado en Acupuntura Estética'
  },
  'stretching-terapeutico-presencial': {
    'name': 'Curso Presencial de Stretching Terapéutico',
    'description': 'Curso presencial de stretching terapéutico. Aprende técnicas de estiramiento asistido y rehabilitación funcional.',
    'duration': 'P2M',
    'timeRequired': 'P2M',
    'offers': {
      '@type': 'Offer',
      'price': '250',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado en Stretching Terapéutico'
  },
  'electroacupuntura': {
    'name': 'Seminario Virtual de Electroacupuntura Clínica',
    'description': 'Seminario de 8 horas grabado con teoría aplicada a la práctica con casos reales. Docente: Lic. Lázaro Regalado Ponte.',
    'duration': 'PT8H',
    'timeRequired': 'PT8H',
    'offers': {
      '@type': 'Offer',
      'price': '180',
      'priceCurrency': 'PEN',
      'availability': 'https://schema.org/InStock',
      'priceValidUntil': '2026-12-31'
    },
    'educationalCredentialAwarded': 'Certificado Oficial en Electroacupuntura Clínica',
    'audience': {
      '@type': 'Audience',
      'audienceType': 'Profesionales de la salud, acupuntores y terapeutas'
    }
  }
};

/** Cursos conocidos para normalización de rutas */
const KNOWN_COURSES = [
  'acupuntura-china', 'auriculoterapia', 'masaje-terapeutico',
  'reflexologia-podal-presencial', 'paralisis-facial-presencial',
  'moxibustion-ventosas-presencial', 'acupuntura-estetica-presencial',
  'stretching-terapeutico-presencial', 'acupuntura-china-7-meses',
  'electroacupuntura', 'electroacupuntura-online'
];

/**
 * Mapa de metadata SEO por ruta normalizada.
 */
export const ROUTE_SEO: Record<string, SeoData> = {
  '/inicio': {
    title: 'Plataforma LMS — Instituto de Terapias Integrales | Cursos Online',
    description: 'Descubre Plataforma LMS, el instituto online líder en terapias complementarias en Perú. +5,000 terapeutas certificados. Cursos de acupuntura, auriculoterapia, masaje terapéutico con certificación internacional.',
    ogTitle: 'Plataforma LMS — Formación en Terapias Integrales',
    ogDescription: 'Estudia desde casa y transforma tu carrera. Cursos con certificación internacional.',
    keywords: 'terapias integrales, cursos online, certificación, acupuntura, auriculoterapia, Plataforma LMS, Perú'
  },
  '/programas': {
    title: 'Programas de Estudio — Plataforma LMS | Terapias Integrales',
    description: 'Explora todos nuestros programas: acupuntura china, auriculoterapia, masaje terapéutico y más. Formación profesional con certificación oficial.',
    ogTitle: 'Programas de Estudio — Plataforma LMS',
    ogDescription: 'Formación profesional en terapias complementarias. Elige tu especialidad.',
    keywords: 'programas, acupuntura china, auriculoterapia, masaje terapéutico, cursos Plataforma LMS'
  },
  '/cursos': {
    title: 'Todos los Cursos — Plataforma LMS | Catálogo Completo',
    description: 'Catálogo completo de cursos online y presenciales en terapias complementarias. Acupuntura, auriculoterapia, masaje terapéutico, reflexología y más. Certificación internacional.',
    ogTitle: 'Catálogo de Cursos — Plataforma LMS',
    ogDescription: 'Explora nuestro catálogo completo de cursos en terapias complementarias.',
    keywords: 'cursos online, cursos presenciales, terapias complementarias, catálogo Plataforma LMS'
  },
  '/cursos/acupuntura-china': {
    title: 'Acupuntura China — Curso Profesional | Plataforma LMS',
    description: 'Formación profesional en Acupuntura China. 12 meses, modalidad híbrida. Aprende canales energéticos, moxibustión, electroacupuntura y más. Certificación oficial.',
    ogTitle: 'Curso de Acupuntura China — Plataforma LMS',
    ogDescription: 'Formación completa en Acupuntura China. 12 meses con práctica clínica supervisada.',
    keywords: 'acupuntura china, curso acupuntura, medicina tradicional china, moxibustión, electroacupuntura'
  },
  '/cursos/auriculoterapia': {
    title: 'Auriculoterapia — Curso Profesional | Plataforma LMS',
    description: 'Curso profesional de Auriculoterapia. 2 meses, modalidad presencial. Aprende somatotopía auricular, protocolos clínicos y técnicas de estimulación. Kit incluido.',
    ogTitle: 'Curso de Auriculoterapia — Plataforma LMS',
    ogDescription: 'Domina la terapia refleja auricular. Curso presencial con materiales incluidos.',
    keywords: 'auriculoterapia, curso auriculoterapia, terapia refleja, somatotopía auricular'
  },
  '/cursos/masaje-terapeutico': {
    title: 'Masaje Terapéutico — Curso Profesional | Plataforma LMS',
    description: 'Formación profesional en Masaje Terapéutico. Aprende técnicas de digitopresión, masaje deportivo y descontracturante. Certificación oficial.',
    ogTitle: 'Curso de Masaje Terapéutico — Plataforma LMS',
    ogDescription: 'Formación completa en Masaje Terapéutico con práctica guiada.',
    keywords: 'masaje terapéutico, curso masaje, digitopresión, masaje deportivo, terapia manual'
  },
  '/cursos/reflexologia-podal-presencial': {
    title: 'Reflexología Podal — Curso Presencial | Plataforma LMS',
    description: 'Curso presencial de Reflexología Podal. Aprende técnicas de masaje reflejo en los pies para el diagnóstico y tratamiento de desórdenes sistémicos.',
    ogTitle: 'Curso de Reflexología Podal — Plataforma LMS',
    ogDescription: 'Formación presencial en Reflexología Podal con práctica supervisada.',
    keywords: 'reflexología podal, masaje reflejo, curso presencial, Plataforma LMS'
  },
  '/cursos/paralisis-facial-presencial': {
    title: 'Parálisis Facial — Curso Presencial | Plataforma LMS',
    description: 'Curso presencial especializado en tratamiento de parálisis facial mediante técnicas de medicina tradicional china y terapia manual.',
    ogTitle: 'Curso de Parálisis Facial — Plataforma LMS',
    ogDescription: 'Tratamiento de parálisis facial con técnicas de medicina tradicional china.',
    keywords: 'parálisis facial, tratamiento facial, curso presencial, medicina china'
  },
  '/cursos/moxibustion-ventosas-presencial': {
    title: 'Moxibustión y Ventosas — Curso Presencial | Plataforma LMS',
    description: 'Curso presencial de Moxibustión y Ventosas. Aprende técnicas de calentamiento terapéutico y liberación miofascial.',
    ogTitle: 'Curso de Moxibustión y Ventosas — Plataforma LMS',
    ogDescription: 'Técnicas de moxibustión y ventosas para terapia manual.',
    keywords: 'moxibustión, ventosas, terapia manual, curso presencial'
  },
  '/cursos/acupuntura-estetica-presencial': {
    title: 'Acupuntura Estética — Curso Presencial | Plataforma LMS',
    description: 'Curso presencial de Acupuntura Estética. Aprende técnicas de rejuvenecimiento facial con acupuntura y medicina tradicional china.',
    ogTitle: 'Curso de Acupuntura Estética — Plataforma LMS',
    ogDescription: 'Rejuvenecimiento facial con acupuntura y medicina tradicional china.',
    keywords: 'acupuntura estética, rejuvenecimiento facial, curso presencial'
  },
  '/cursos/stretching-terapeutico-presencial': {
    title: 'Stretching Terapéutico — Curso Presencial | Plataforma LMS',
    description: 'Curso presencial de Stretching Terapéutico. Aprende técnicas de estiramiento asistido y rehabilitación funcional.',
    ogTitle: 'Curso de Stretching Terapéutico — Plataforma LMS',
    ogDescription: 'Técnicas de estiramiento asistido y rehabilitación funcional.',
    keywords: 'stretching terapéutico, estiramiento, rehabilitación, curso presencial'
  },
  '/cursos/electroacupuntura': {
    title: 'Electroacupuntura — Curso Virtual | Plataforma LMS',
    description: 'Curso virtual de Electroacupuntura Clínica. Aprende parámetros bioeléctricos (Hz), selección de ondas y protocolos de tratamiento en dolor, parálisis facial y rehabilitación motora.',
    ogTitle: 'Curso Virtual de Electroacupuntura — Plataforma LMS',
    ogDescription: 'Domina la electroacupuntura clínica y la neuromodulación del dolor en el aula virtual de Plataforma LMS.',
    keywords: 'electroacupuntura, curso virtual, electroacupuntura online, neuromodulación, medicina tradicional china, Plataforma LMS'
  },
  '/cursos/electroacupuntura-online': {
    title: 'Electroacupuntura Online — Curso Virtual | Plataforma LMS',
    description: 'Curso online de Electroacupuntura Clínica. Formación audiovisual con casos clínicos reales, parámetros y certificación oficial con código QR.',
    ogTitle: 'Curso Online de Electroacupuntura — Plataforma LMS',
    ogDescription: 'Formación 100% online en Electroacupuntura Clínica con respaldo de Plataforma LMS.',
    keywords: 'electroacupuntura online, curso online electroacupuntura, dolor cronico, paralisis facial'
  },
  '/cursos/detalle-curso': {
    title: 'Curso — Plataforma LMS | Formación Profesional',
    description: 'Explora este curso de formación profesional en terapias complementarias. Certificación internacional con respaldo Plataforma LMS.',
    robots: 'index, follow'
  },
  '/certificacion': {
    title: 'Certificación — Plataforma LMS | Respaldo Internacional',
    description: 'Obtén tu certificado digital verificable por QR con respaldo internacional. Avalado por Global Therapy Alliance. Certifica tus competencias en terapias complementarias.',
    ogTitle: 'Certificación Profesional — Plataforma LMS',
    ogDescription: 'Certificado digital verificable con respaldo internacional.',
    keywords: 'certificación, certificado digital, respaldo internacional, Global Therapy Alliance'
  },
  '/por-que-elegirnos': {
    title: '¿Por qué elegir Plataforma LMS? — Instituto de Terapias Integrales',
    description: 'Descubre por qué Plataforma LMS es la mejor opción para tu formación en terapias complementarias. Metodología flexible, docentes expertos, certificación internacional.',
    ogTitle: '¿Por qué elegir Plataforma LMS?',
    ogDescription: 'Metodología flexible, docentes expertos y certificación internacional.',
    keywords: 'por qué elegir Plataforma LMS, institución terapias integrales, formación online'
  },
  '/como-aprenderas': {
    title: 'Metodología de Aprendizaje — Plataforma LMS',
    description: 'Conoce nuestra metodología de aprendizaje: clases en vivo, campus virtual 24/7, prácticas presenciales supervisadas y acompañamiento docente continuo.',
    ogTitle: 'Metodología de Aprendizaje — Plataforma LMS',
    ogDescription: 'Clases en vivo, campus virtual y prácticas presenciales supervisadas.',
    keywords: 'metodología aprendizaje, campus virtual, clases en vivo, prácticas presenciales'
  },
  '/recursos': {
    title: 'Recursos — Plataforma LMS | Material de Estudio',
    description: 'Accede a recursos educativos, guías de estudio, material descargable y herramientas para tu formación en terapias complementarias.',
    ogTitle: 'Recursos Educativos — Plataforma LMS',
    ogDescription: 'Material de estudio, guías y herramientas para tu formación.',
    keywords: 'recursos educativos, material estudio, guías, terapias complementarias'
  },
  '/libros': {
    title: 'Libros y Manuales de Medicina Tradicional China | Plataforma LMS',
    description: 'Biblioteca y publicaciones oficiales de Plataforma LMS. Adquiere libros clínicos, atlas de acupuntura, manuales de electroacupuntura, auriculoterapia, fitoterapia y masaje.',
    ogTitle: 'Libros y Manuales Clínicos — Plataforma LMS',
    ogDescription: 'Biblioteca digital oficial con manuales, atlas y tratados de MTC y terapias integrales.',
    keywords: 'libros acupuntura, manual electroacupuntura, atlas medicina tradicional china, libros auriculoterapia, Plataforma LMS'
  },
  '/sedes': {
    title: 'Sedes a Nivel Nacional — Plataforma LMS | Huánuco, Lima y Piura',
    description: 'Encuentra tu sede más cercana de Plataforma LMS. Conoce nuestras sedes en Lima, Huánuco y Piura para estudiar terapias complementarias con certificación oficial.',
    ogTitle: 'Sedes a Nivel Nacional — Plataforma LMS',
    ogDescription: 'Nuestras sedes en Huánuco, Lima y Piura. Conoce a nuestros representantes e inscríbete a nuestras formaciones presenciales.',
    keywords: 'sedes, sedes Plataforma LMS, sedes lima, sede huanuco, sede piura, medicina complementaria peru'
  },
  '/sedesV2': {
    title: 'Sedes V2 — Plataforma LMS | Rediseño Premium',
    description: 'Conoce la versión mejorada de nuestras sedes a nivel nacional. Huánuco, Lima y Piura con interfaz premium y mapa interactivo.',
    ogTitle: 'Sedes V2 — Plataforma LMS',
    ogDescription: 'Rediseño premium de la red de sedes nacionales de Plataforma LMS.',
    keywords: 'sedes v2, sedes Plataforma LMS, acupuntura peru, sedes de estudio'
  },
  '/login': {
    title: 'Iniciar Sesión — Aula Virtual Plataforma LMS',
    description: 'Accede al aula virtual de Plataforma LMS. Inicia sesión para ver tus cursos, materiales y certificados.',
    robots: 'noindex, nofollow'
  },
  '/validar-certificado': {
    title: 'Validar Certificado — Plataforma LMS',
    description: 'Valida la autenticidad de certificados emitidos por Plataforma LMS. Ingresa el código único de tu certificado para verificar su validez.',
    robots: 'noindex, follow'
  },
  '/dashboard': {
    title: 'Dashboard — Aula Virtual Plataforma LMS',
    description: 'Panel de control del aula virtual Plataforma LMS. Gestiona tus cursos, materiales y certificados.',
    robots: 'noindex, nofollow'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SeoService implements OnDestroy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  /**
   * Hash SHA-256 del último JSON-LD en formato CSP (sin comillas).
   * Ejemplo: "sha256-P91Rq0NvdJOrwS+CSXZ2wN0eoX7lF8BPWq1Y+QmFi3s="
   *
   * Para usarlo en Content-Security-Policy, el servidor debe
   * envolverlo con comillas simples:
   *   Content-Security-Policy: default-src 'self'; script-src 'sha256-...'
   *
   * ⚠️ El hash cambia por ruta porque el JSON-LD es dinámico.
   * En producción, la política CSP debe incluir todos los hashes
   * posibles o usar un enfoque nonce + strict-dynamic.
   */
  currentCspHash: string | null = null;

  constructor() {
    this.listenToRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToRouteChanges(): void {
    // Escuchar cambios de ruta Y aplicar SEO inicial usando startWith(null)
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null as NavigationEnd | null),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data),
      takeUntil(this.destroy$)
    ).subscribe((data: Data) => {
      const routePath = this.getRoutePath();
      const seo = this.mergeSeoData(routePath, data);
      this.applySeo(seo);
    });
  }

  private getRoutePath(): string {
    return this.router.url.split('?')[0].split('#')[0];
  }

  private normalizePath(path: string): string {
    const normalized = path.replace(/\.html$/, '');

    // Rutas de cursos presenciales conocidos
    if (normalized.startsWith('/cursos/')) {
      const courseSlug = normalized.replace('/cursos/', '');
      if (KNOWN_COURSES.includes(courseSlug)) {
        return `/cursos/${courseSlug}`;
      }
      if (courseSlug.length > 0) {
        return '/cursos/detalle-curso';
      }
      return '/cursos';
    }

    // Certificados dinámicos
    if (normalized.startsWith('/certificados/validar/')) {
      return '/validar-certificado';
    }

    // Dashboard y sub-rutas
    if (normalized.startsWith('/dashboard')) {
      return '/dashboard';
    }

    return normalized || '/inicio';
  }

  private mergeSeoData(routePath: string, routeData: Data): SeoData {
    const normalizedPath = this.normalizePath(routePath);
    const routeSeo = ROUTE_SEO[normalizedPath] || ROUTE_SEO[normalizedPath + '/'] || {};
    const dataSeo: SeoData = {
      title: routeData['seoTitle'] || routeData['title'],
      description: routeData['seoDescription'],
      ogTitle: routeData['ogTitle'],
      ogDescription: routeData['ogDescription'],
      ogImage: routeData['ogImage'],
      keywords: routeData['keywords']
    };
    return { ...DEFAULT_SEO, ...routeSeo, ...dataSeo };
  }

  private applySeo(seo: SeoData): void {
    const fullTitle = seo.title || DEFAULT_SEO.title;
    const routePath = this.getRoutePath();
    const canonicalUrl = seo.canonicalUrl || `https://Plataforma LMS.com${routePath}`;

    // Title
    this.title.setTitle(fullTitle);

    // Meta tags básicos
    this.updateMetaTag('description', seo.description || DEFAULT_SEO.description);
    this.updateMetaTag('keywords', seo.keywords || DEFAULT_SEO.keywords || '');
    this.updateMetaTag('robots', seo.robots || 'index, follow');

    // Open Graph
    this.updateMetaTag('og:title', seo.ogTitle || seo.title || DEFAULT_SEO.ogTitle!);
    this.updateMetaTag('og:description', seo.ogDescription || seo.description || DEFAULT_SEO.ogDescription!);
    this.updateMetaTag('og:image', seo.ogImage || DEFAULT_SEO.ogImage!);
    this.updateMetaTag('og:image:width', seo.ogImageWidth || DEFAULT_SEO.ogImageWidth!);
    this.updateMetaTag('og:image:height', seo.ogImageHeight || DEFAULT_SEO.ogImageHeight!);
    this.updateMetaTag('og:image:alt', seo.ogImageAlt || DEFAULT_SEO.ogImageAlt!);
    this.updateMetaTag('og:type', seo.ogType || DEFAULT_SEO.ogType!);
    this.updateMetaTag('og:locale', seo.ogLocale || DEFAULT_SEO.ogLocale!);
    this.updateMetaTag('og:url', canonicalUrl);

    // Twitter Card
    this.updateMetaTag('twitter:card', seo.twitterCard || DEFAULT_SEO.twitterCard!);
    this.updateMetaTag('twitter:title', seo.ogTitle || seo.title || DEFAULT_SEO.ogTitle!);
    this.updateMetaTag('twitter:description', seo.ogDescription || seo.description || DEFAULT_SEO.ogDescription!);
    this.updateMetaTag('twitter:image', seo.ogImage || DEFAULT_SEO.ogImage!);
    this.updateMetaTag('twitter:image:alt', seo.ogImageAlt || DEFAULT_SEO.ogImageAlt!);
    this.updateMetaTag('twitter:url', canonicalUrl);

    // Canonical
    this.updateCanonical(canonicalUrl);

    // JSON-LD Structured Data
    this.updateJsonLd(routePath, seo);
  }

  // ──────────────────────────────────────────────────────────
  //  JSON-LD Structured Data
  // ──────────────────────────────────────────────────────────

  private updateJsonLd(routePath: string, seo: SeoData): void {
    const normalizedPath = this.normalizePath(routePath);
    let schema: object;

    if (normalizedPath.startsWith('/cursos/') && normalizedPath !== '/cursos') {
      schema = this.buildCourseSchema(normalizedPath, seo);
    } else if (normalizedPath === '/inicio') {
      schema = this.buildOrganizationSchema(seo);
    } else if (normalizedPath === '/certificacion') {
      schema = this.buildCertificationSchema(seo);
    } else if (normalizedPath === '/programas') {
      schema = this.buildOrganizationSchema(seo);
    } else if (normalizedPath === '/como-aprenderas') {
      schema = this.buildLearningResourceSchema(seo);
    } else if (normalizedPath === '/validar-certificado') {
      schema = this.buildWebPageSchema(seo);
    } else {
      schema = this.buildWebPageSchema(seo);
    }

    this.injectJsonLd(schema);
  }

  private buildOrganizationSchema(seo: SeoData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      'name': 'Plataforma LMS — Instituto de Terapias Integrales',
      'description': seo.description || DEFAULT_SEO.description,
      'url': 'https://Plataforma LMS.com/',
      'logo': 'https://Plataforma LMS.com/assets/plataforma_lms-logo.png',
      'image': seo.ogImage || DEFAULT_SEO.ogImage,
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'PE'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'ratingCount': '5000',
        'bestRating': '5.0'
      },
      'offers': {
        '@type': 'Offer',
        'category': 'Online course',
        'availability': 'https://schema.org/InStock',
        'priceCurrency': 'PEN'
      }
    };
  }

  private buildCourseSchema(coursePath: string, seo: SeoData): object {
    const courseSlug = coursePath.replace('/cursos/', '');
    const courseData = COURSE_JSONLD[courseSlug];

    const base: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      'name': seo.title?.replace(' — Plataforma LMS', '').replace('| Plataforma LMS', '').trim() || 'Curso Plataforma LMS',
      'description': seo.description || DEFAULT_SEO.description,
      'url': `https://Plataforma LMS.com${coursePath}`,
      'image': seo.ogImage || DEFAULT_SEO.ogImage,
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'Plataforma LMS — Instituto de Terapias Integrales',
        'url': 'https://Plataforma LMS.com/'
      }
    };

    if (courseData) {
      Object.assign(base, courseData);
    }

    return base;
  }

  private buildCertificationSchema(seo: SeoData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOccupationalCredential',
      'name': 'Certificación Plataforma LMS en Terapias Integrales',
      'description': seo.description || DEFAULT_SEO.description,
      'url': 'https://Plataforma LMS.com/certificacion',
      'image': seo.ogImage || DEFAULT_SEO.ogImage,
      'credentialCategory': 'Certificate',
      'validIn': 'PE',
      'offeredBy': {
        '@type': 'EducationalOrganization',
        'name': 'Plataforma LMS — Instituto de Terapias Integrales',
        'url': 'https://Plataforma LMS.com/'
      }
    };
  }

  private buildLearningResourceSchema(seo: SeoData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      'name': seo.title || DEFAULT_SEO.title,
      'description': seo.description || DEFAULT_SEO.description,
      'url': `https://Plataforma LMS.com${this.getRoutePath()}`,
      'image': seo.ogImage || DEFAULT_SEO.ogImage,
      'educationalLevel': 'Professional',
      'teaches': [
        'Terapias complementarias',
        'Medicina tradicional china',
        'Técnicas de masaje terapéutico'
      ],
      'provider': {
        '@type': 'EducationalOrganization',
        'name': 'Plataforma LMS — Instituto de Terapias Integrales',
        'url': 'https://Plataforma LMS.com/'
      }
    };
  }

  private buildWebPageSchema(seo: SeoData): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': seo.title || DEFAULT_SEO.title,
      'description': seo.description || DEFAULT_SEO.description,
      'url': `https://Plataforma LMS.com${this.getRoutePath()}`,
      'image': seo.ogImage || DEFAULT_SEO.ogImage,
      'about': {
        '@type': 'EducationalOrganization',
        'name': 'Plataforma LMS — Instituto de Terapias Integrales'
      }
    };
  }

  private injectJsonLd(schema: object): void {
    const scriptId = 'Plataforma LMS-jsonld';
    let script: HTMLScriptElement | null = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const jsonLdString = JSON.stringify(schema, null, 2);
    script.textContent = jsonLdString;

    // Computar hash SHA-256 del contenido JSON-LD para CSP
    this.computeHash(jsonLdString).then((hash) => {
      this.currentCspHash = hash;
      script.setAttribute('data-csp-hash', hash);
    });
  }

  /**
   * Computa el hash SHA-256 en formato base64 del contenido dado.
   * Formato compatible con CSP: 'sha256-{base64}'.
   */
  private async computeHash(content: string): Promise<string> {
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      // Fallback si Web Crypto no está disponible
      return 'sha256-webcrypto-unavailable';
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convertir ArrayBuffer a base64
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const base64 = btoa(String.fromCharCode(...hashArray));

      // Formato CSP: 'sha256-{hash}'
      return `sha256-${base64}`;
    } catch {
      return 'sha256-computation-failed';
    }
  }

  // ──────────────────────────────────────────────────────────
  //  Meta Tags
  // ──────────────────────────────────────────────────────────

  private updateMetaTag(name: string, content: string): void {
    if (!content) return;
    const attribute = name.startsWith('og:') || name.startsWith('twitter:')
      ? 'property'
      : 'name';
    const selector = `${attribute}="${name}"`;
    const existing: HTMLMetaElement | null = this.meta.getTag(selector);
    if (existing) {
      this.meta.updateTag({ [attribute]: name, content });
    } else {
      this.meta.addTag({ [attribute]: name, content });
    }
  }

  private updateCanonical(url: string): void {
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }
  }
}
