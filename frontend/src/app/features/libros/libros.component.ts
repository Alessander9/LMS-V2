import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import {
  NewsletterBookshelfComponent,
  NewsletterBookshelfItem
} from '../../shared/components/newsletter-bookshelf/newsletter-bookshelf.component';

export interface LibroGaleriaItem {
  url: string;
  label: string;
  descripcion?: string;
}

export interface LibroItem {
  id: string;
  titulo: string;
  subtitulo: string;
  autor: string;
  categoria: string;
  categoriaSlug: string;
  precioSoles: number;
  paginas: number;
  anio: string;
  formato: string;
  portada: string;
  galeria?: LibroGaleriaItem[];
  destacado?: boolean;
  bestseller?: boolean;
  nuevo?: boolean;
  resumen: string;
  capitulos: string[];
  etiquetas: string[];
  cursoRelacionado?: {
    nombre: string;
    ruta: string;
  };
}

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    NewsletterBookshelfComponent
  ],
  templateUrl: './libros.component.html',
  styleUrls: ['./libros.component.css']
})
export class LibrosComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bookshelfSection') bookshelfSectionRef?: ElementRef<HTMLElement>;
  private intersectionObserver?: IntersectionObserver;

  searchQuery = '';
  selectedCategory = 'todos';
  selectedBook: LibroItem | null = null;
  showModal = false;

  readonly categories = [
    { id: 'todos', label: 'Todos los Libros' },
    { id: 'acupuntura', label: 'Acupuntura & MTC' },
    { id: 'electro', label: 'Electroacupuntura' },
    { id: 'auriculo', label: 'Auriculoterapia' },
    { id: 'manuales', label: 'Masaje & Terapias Manuales' },
    { id: 'fitoterapia', label: 'Fitoterapia & Plantas' },
    { id: 'nutricion', label: 'Dietética & Nutrición' }
  ];

  readonly libros: LibroItem[] = [
    {
      id: 'tratado-acupuntura-mtc',
      titulo: 'Atlas y Tratado Clínico de Acupuntura Tradicional China',
      subtitulo: 'Meridianos, puntos principales, extraordinarios y protocolos terapéuticos de alta precisión.',
      autor: 'Equipo de Especialistas MTC Plataforma LMS',
      categoria: 'Acupuntura & MTC',
      categoriaSlug: 'acupuntura',
      precioSoles: 65,
      paginas: 340,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD + Opcional Impreso',
      portada: 'assets/Acupunturaplataforma_lms2.jpg',
      destacado: true,
      bestseller: true,
      resumen: 'Una obra fundamental y de consulta diaria para acupuntores y terapeutas integrales. Incluye mapas anatómicos en alta resolución, localización exacta cun por cun, profundidad y ángulo de punción, funciones bioenergéticas y combinaciones sinérgicas para más de 120 patologías frecuentes.',
      capitulos: [
        'Capítulo I: Fundamentos y Biofísica de los Canales y Colaterales (Jing Luo)',
        'Capítulo II: Los 12 Meridianos Principales y sus Puntos de Comando',
        'Capítulo III: Los 8 Vasos Extraordinarios y Puntos Curiosos (Extraordinarios)',
        'Capítulo IV: Semiología, Diagnóstico por Pulso y Lengua según los 5 Elementos',
        'Capítulo V: Protocolos Terapéuticos para Síndromes Bi (Dolor), Lumbalgias y Ciática',
        'Capítulo VI: Guía de Bioseguridad y Técnicas de Manipulación de Agujas'
      ],
      etiquetas: ['Acupuntura', 'Atlas Clínico', 'Puntos Extraordinarios', 'Diagnóstico MTC'],
      cursoRelacionado: {
        nombre: 'Diplomado en Acupuntura China',
        ruta: '/cursos/acupuntura-china'
      }
    },
    {
      id: 'manual-electroacupuntura',
      titulo: 'Manual de Electroacupuntura Clínica y Neuromodulación',
      subtitulo: 'Frecuencias en Hertz, polaridad, selección de ondas y protocolos basados en casos clínicos reales.',
      autor: 'Lic. Lázaro Regalado Ponte',
      categoria: 'Electroacupuntura',
      categoriaSlug: 'electro',
      precioSoles: 55,
      paginas: 195,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/electroAcupuntura_IMG/foto_electro.jpg',
      destacado: true,
      nuevo: true,
      resumen: 'El texto de referencia redactado por el docente especialista Lic. Lázaro Regalado. Explica la calibración de electroestimuladores, manejo de canales positivos y negativos, selección de ondas continuas, densas y dispersas, y protocolos aplicados a traumatología, dolor crónico, neurología y parálisis facial.',
      capitulos: [
        'Capítulo I: Principios de Bioelectricidad y Neurofisiología Analgésica',
        'Capítulo II: Frecuencias Terapéuticas (Hz) y Tipos de Ondas Electroestimuladoras',
        'Capítulo III: Conexión de Clips, Polaridad y Manejo Seguro de Equipos',
        'Capítulo IV: Protocolos Clínicos de Alto Impacto para Dolor Articular y Muscular',
        'Capítulo V: Abordaje Neuromuscular de la Parálisis Facial Periférica',
        'Capítulo VI: Electroacupuntura Aplicada a la Estética Facial y Tonificación'
      ],
      etiquetas: ['Electroacupuntura', 'Neuromodulación', 'Frecuencias Hz', 'Casos Reales'],
      cursoRelacionado: {
        nombre: 'Curso Virtual de Electroacupuntura',
        ruta: '/cursos/electroacupuntura'
      }
    },
    {
      id: 'tratado-auriculoterapia-clinica',
      titulo: 'Tratado de Auriculoterapia China y Francesa: Mapas y Protocolos',
      subtitulo: 'Topografía auricular completa, detección de zonas reactivas y tratamiento del dolor.',
      autor: 'Dirección Académica Plataforma LMS',
      categoria: 'Auriculoterapia',
      categoriaSlug: 'auriculo',
      precioSoles: 48,
      paginas: 220,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/Auriculoterapia plataforma_lms.jpg',
      bestseller: true,
      resumen: 'Atlas completo que integra la Escuela China tradicional y la Escuela Francesa del Dr. Paul Nogier. Contiene ilustraciones anatómicas detalladas de la oreja, técnicas de siembra con semillas de vaccaria, balines de oro y plata, y agujas chincheta para ansiedad, control de peso, insomnio y estrés.',
      capitulos: [
        'Capítulo I: Embriología y Cartografía Somatotópica del Pabellón Auricular',
        'Capítulo II: Métodos de Inspección Visual, Palpación y Exploración Eléctrica',
        'Capítulo III: Puntos Auriculares Clave: Shenmen, Simpático, Cero y Tálamo',
        'Capítulo IV: Protocolos para Ansiedad, Adicciones y Regulación del Apetito',
        'Capítulo V: Tratamiento del Dolor Cervical, Lumbar y Cefaleas Migrañosas',
        'Capítulo VI: Precauciones, Higiene y Prevención de Condritis'
      ],
      etiquetas: ['Auriculoterapia', 'Nogier', 'Pabellón Auricular', 'Control de Peso'],
      cursoRelacionado: {
        nombre: 'Curso de Auriculoterapia',
        ruta: '/cursos/auriculoterapia'
      }
    },
    {
      id: 'guia-digitopresion-masaje',
      titulo: 'Guía Terapéutica de Digitopresión Mecánica y Masaje Funcional',
      subtitulo: 'Técnicas de presión digital, desbloqueo de meridianos y liberación miofascial.',
      autor: 'Área de Fisioterapia & Terapias Manuales Plataforma LMS',
      categoria: 'Masaje & Terapias Manuales',
      categoriaSlug: 'manuales',
      precioSoles: 45,
      paginas: 175,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/MasajeDigitoPresionplataforma_lms.jpg',
      resumen: 'Manual práctico paso a paso para terapeutas manuales. Detalla maniobras de presión profunda, puntos gatillo miofasciales, técnicas de deslizamiento sobre trayectos energéticos y secuencias completas para espalda, cuello, hombros y extremidades.',
      capitulos: [
        'Capítulo I: Principios Mecánicos y Biomecánica de la Digitopresión',
        'Capítulo II: Puntos Ashi, Puntos Gatillo y Zonas de Tensión Muscular',
        'Capítulo III: Protocolo Descontracturante para Columna Vertebral y Lumbalgias',
        'Capítulo IV: Masaje de Descarga y Movilización Articular',
        'Capítulo V: Tratamiento de Tendinopatías y Fascitis Plantar con Digitopresión',
        'Capítulo VI: Ergonomía y Autocuidado del Terapeuta Manual'
      ],
      etiquetas: ['Digitopresión', 'Masaje Terapéutico', 'Puntos Gatillo', 'Miofascial'],
      cursoRelacionado: {
        nombre: 'Curso de Digitopresión Presencial',
        ruta: '/cursos/digitopresion-presencial'
      }
    },
    {
      id: 'compendio-fitoterapia-plantas',
      titulo: 'Compendio de Fitoterapia y Plantas Medicinales del Perú y Oriente',
      subtitulo: 'Monografías botánicas, principios activos, sinergias y fórmulas magistrales.',
      autor: 'Docencia Botánica & Fitoterapia Plataforma LMS',
      categoria: 'Fitoterapia & Plantas',
      categoriaSlug: 'fitoterapia',
      precioSoles: 50,
      paginas: 260,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/fitoterapia_plataforma_lms.jpg',
      resumen: 'Un compendio exhaustivo que une la farmacopea tradicional andino-amazónica y las plantas medicinales de la MTC. Incluye métodos de extracción (tisanas, decocciones, tinturas madres y ungüentos), posologías seguras, interacciones farmacológicas y fichas técnicas ilustradas.',
      capitulos: [
        'Capítulo I: Principios Activos y Fitoquímica Básica para Terapeutas',
        'Capítulo II: Plantas Medicinales Nativas del Perú (Uña de Gato, Sangre de Grado, Chancapiedra)',
        'Capítulo III: Fitoterapia Oriental: Ginseng, Astrágalo, Jengibre y Canela',
        'Capítulo IV: Elaboración Práctica de Tinturas Madres, Extractos y Pomadas',
        'Capítulo V: Fórmulas Fitoterapéuticas para Sistemas Digestivo, Respiratorio y Urinario',
        'Capítulo VI: Toxicidad, Contraindicaciones y Dosificación Clínica Pediátrica y Adulta'
      ],
      etiquetas: ['Fitoterapia', 'Plantas Medicinales', 'Tinturas Madres', 'Medicina Andina'],
      cursoRelacionado: {
        nombre: 'Curso de Fitoterapia Presencial',
        ruta: '/cursos/fitoterapia-presencial'
      }
    },
    {
      id: 'dietetica-energetica-5-elementos',
      titulo: 'Dietética Energética y Nutrición según los 5 Elementos',
      subtitulo: 'Propiedades térmicas, sabores, trofología y planes nutricionales personalizados.',
      autor: 'Especialistas en Nutrición Integrativa Plataforma LMS',
      categoria: 'Dietética & Nutrición',
      categoriaSlug: 'nutricion',
      precioSoles: 45,
      paginas: 190,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/plataforma_lms_dietetica.jpg',
      resumen: 'Aprende a utilizar los alimentos como medicina según su naturaleza térmica (fría, fresca, neutra, tibia y caliente), sus cinco sabores (ácido, amargo, dulce, picante y salado) y su tropismo por los órganos Zang-Fu. Incluye recetas terapéuticas y dietoterapias para desbalances metabólicos.',
      capitulos: [
        'Capítulo I: La Naturaleza y Energía de los Alimentos según la MTC',
        'Capítulo II: Los 5 Sabores y su Acción sobre Hígado, Corazón, Bazo, Pulmón y Riñón',
        'Capítulo III: Dietoterapia para el Síndrome de Humedad-Calor y Retención de Líquidos',
        'Capítulo IV: Alimentación Estacional y Armonización Inmune',
        'Capítulo V: Planes Alimentarios para Control de Peso y Trastornos Digestivos',
        'Capítulo VI: Recetario Clínico Terapéutico y Combinaciones Óptimas'
      ],
      etiquetas: ['Dietética', 'Nutrición Energética', '5 Elementos', 'Trofología'],
      cursoRelacionado: {
        nombre: 'Curso de Dietética Presencial',
        ruta: '/cursos/dietetica-presencial'
      }
    },
    {
      id: 'moxibustion-ventosas-terapias',
      titulo: 'Manual Clínico de Moxibustión, Ventosas y Terapias Térmicas',
      subtitulo: 'Técnicas de calor con artemisa, ventosaterapia de succión y sangría terapéutica.',
      autor: 'Cuerpo Docente en MTC Plataforma LMS',
      categoria: 'Acupuntura & MTC',
      categoriaSlug: 'acupuntura',
      precioSoles: 42,
      paginas: 160,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/curso_moxi_index.jpg',
      resumen: 'Guía visual imprescindible para dominar la moxibustión directa e indirecta (puros de moxa, conos sobre jengibre/sal/ajo) y la aplicación de ventosas de cristal y neumáticas fijas, móviles y con escarificación para expulsión de frío, humedad y estasis sanguínea.',
      capitulos: [
        'Capítulo I: Propiedades Terapéuticas de la Artemisa Vulgaris (Ai Ye)',
        'Capítulo II: Métodos de Moxibustión Directa, Indirecta y Aguja Caliente',
        'Capítulo III: Ventosaterapia: Ventosa Seca, Móvil y Sangría con Martillo de Flor de Ciruelo',
        'Capítulo IV: Tratamiento de Lumbalgias Frías, Artrosis y Asma Bronquial',
        'Capítulo V: Moxibustión Preventiva y Tonificación del Sistema Inmune (Zu San Li)',
        'Capítulo VI: Normas de Ventilación, Precauciones y Manejo de Quemaduras Leves'
      ],
      etiquetas: ['Moxibustión', 'Ventosas', 'Artemisa', 'Terapias Térmicas'],
      cursoRelacionado: {
        nombre: 'Taller de Moxibustión y Ventosas',
        ruta: '/programas'
      }
    },
    {
      id: 'guia-reflexologia-podal',
      titulo: 'Atlas Clínico de Reflexología Podal y Zonas Reflejas',
      subtitulo: 'Mapas neuro-reflejos de la planta del pie, técnicas de estimulación y abordaje integral.',
      autor: 'Especialistas en Reflexología Plataforma LMS',
      categoria: 'Masaje & Terapias Manuales',
      categoriaSlug: 'manuales',
      precioSoles: 45,
      paginas: 180,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD',
      portada: 'assets/reflexologia_img_curso.jpg',
      resumen: 'Un atlas didáctico que correlaciona las zonas reflejas del pie con los sistemas nervioso, digestivo, endocrino y circulatorio. Enseña maniobras de reptación con el pulgar, lectura diagnóstica podal y secuencias completas de relajación y homeostasis orgánica.',
      capitulos: [
        'Capítulo I: Fisiología de la Respuesta Neuro-Refleja en el Pie',
        'Capítulo II: Mapa Topográfico Podal Izquierdo y Derecho',
        'Capítulo III: Técnicas de Presión, Deslizamiento y Fricción Refleja',
        'Capítulo IV: Protocolo Anti-Estrés, Regulación del Sueño y Dolores de Cabeza',
        'Capítulo V: Tratamiento Reflejo para Trastornos Gastrointestinales',
        'Capítulo VI: Cuidados del Pie, Reacciones Curativas y Contraindicaciones'
      ],
      etiquetas: ['Reflexología Podal', 'Zonas Reflejas', 'Terapia Neuro-Refleja', 'Homeostasis'],
      cursoRelacionado: {
        nombre: 'Seminario de Reflexología Online',
        ruta: '/cursos/seminario-reflexologia-online'
      }
    },
    {
      id: 'acupuntura-estetica-facial',
      titulo: 'Acupuntura Estética Facial y Protocolos Rejuvenecedores',
      subtitulo: 'Bases, técnicas y aplicaciones para una práctica terapéutica segura y efectiva. Microagujas, tonificación y rejuvenecimiento.',
      autor: 'Cuerpo Docente en Estética Integral Plataforma LMS',
      categoria: 'Acupuntura & MTC',
      categoriaSlug: 'acupuntura',
      precioSoles: 55,
      paginas: 210,
      anio: 'Edición 2026',
      formato: 'PDF Digital HD + Fichas Clínicas',
      portada: 'assets/libroPortada_Acu_Estetica/1.png',
      galeria: [
        {
          url: 'assets/libroPortada_Acu_Estetica/1.png',
          label: 'Portada Principal',
          descripcion: 'Encuadernación de lujo con estampado en oro y grabado botánico de flor de loto.'
        },
        {
          url: 'assets/libroPortada_Acu_Estetica/2.png',
          label: 'Contraportada & Sinopsis',
          descripcion: 'Resumen clínico, código de barras ISBN y sello oficial editorial Plataforma LMS.'
        },
        {
          url: 'assets/libroPortada_Acu_Estetica/3.png',
          label: 'Páginas Interiores',
          descripcion: 'Diseño interior en papel apergaminado y diagramas con agujas de acupuntura.'
        },
        {
          url: 'assets/libroPortada_Acu_Estetica/4.png',
          label: 'Sobrecubierta Completa',
          descripcion: 'Despliegue integral de cubierta frontal, lomo dorado y contracubierta.'
        }
      ],
      destacado: true,
      nuevo: true,
      bestseller: true,
      resumen: 'Obra especializada en protocolos de acupuntura cosmética, dermocosmética china y rejuvenecimiento facial no invasivo. Aborda la inserción de microagujas intradérmicas, lifting facial bioenergético, tratamiento de líneas de expresión, flacidez cutánea, melasma y drenaje linfático con guasha de jade.',
      capitulos: [
        'Capítulo I: Anatomía Funcional y Biofísica de la Piel y Fascia Facial',
        'Capítulo II: Cartografía de Puntos Motores y Puntos de Belleza en el Rostro',
        'Capítulo III: Protocolo Antienvejecimiento y Lifting con Microagujas Intradérmicas',
        'Capítulo IV: Manejo de Manchas, Melasma y Ojeras según los Órganos Zang-Fu',
        'Capítulo V: Sinergia con Guasha de Jade, Rodillos Térmicos y Aceites Esenciales',
        'Capítulo VI: Normas de Asepsia, Bioseguridad y Consentimiento Informado'
      ],
      etiquetas: ['Acupuntura Estética', 'Lifting Facial', 'Rejuvenecimiento', 'Guasha', 'Microagujas'],
      cursoRelacionado: {
        nombre: 'Curso de Acupuntura Estética Presencial',
        ruta: '/cursos/acupuntura-estetica-presencial'
      }
    }
  ];

  activeModalImage = '';
  activeModalImageIndex = 0;

  ngOnInit(): void {}

  get filteredLibros(): LibroItem[] {
    return this.libros.filter(libro => {
      const matchCategory = this.selectedCategory === 'todos' || libro.categoriaSlug === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        libro.titulo.toLowerCase().includes(q) ||
        libro.subtitulo.toLowerCase().includes(q) ||
        libro.autor.toLowerCase().includes(q) ||
        libro.etiquetas.some(t => t.toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }

  setCategory(catId: string): void {
    this.selectedCategory = catId;
  }

  openDetails(libro: LibroItem, initialImage?: string): void {
    this.selectedBook = libro;
    this.activeModalImage = initialImage || (libro.galeria?.length ? libro.galeria[0].url : libro.portada);
    this.activeModalImageIndex = libro.galeria
      ? Math.max(0, libro.galeria.findIndex(g => g.url === this.activeModalImage))
      : 0;
    this.showModal = true;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  setModalImage(url: string, index: number): void {
    this.activeModalImage = url;
    this.activeModalImageIndex = index;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBook = null;
    this.activeModalImage = '';
    this.activeModalImageIndex = 0;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  getWhatsAppLink(libro: LibroItem): string {
    const text = `Hola Plataforma LMS, deseo adquirir el libro digital: "${libro.titulo}" (S/ ${libro.precioSoles}). Por favor, indíquenme los métodos de pago y el enlace de descarga inmediata.`;
    return `https://wa.me/51939371250?text=${encodeURIComponent(text)}`;
  }

  on3DBookViewDetails(event: { item: NewsletterBookshelfItem; index: number }): void {
    const matched = this.libros.find(l => 
      l.titulo.toLowerCase().includes(event.item.title.toLowerCase().slice(0, 15)) ||
      event.item.title.toLowerCase().includes(l.titulo.toLowerCase().slice(0, 15))
    );
    if (matched) {
      this.openDetails(matched);
    } else {
      // Create fallback item from 3D data
      const fallback: LibroItem = {
        id: event.item.id,
        titulo: event.item.title,
        subtitulo: event.item.subtitle || 'Publicación y material de estudio oficial del Instituto Plataforma LMS.',
        autor: event.item.author || 'Cuerpo Docente Plataforma LMS',
        categoria: event.item.category || 'MTC & Terapias Integrales',
        categoriaSlug: 'todos',
        precioSoles: event.item.price || 50,
        paginas: 220,
        anio: 'Edición 2026',
        formato: 'PDF Digital HD',
        portada: 'assets/Acupunturaplataforma_lms2.jpg',
        resumen: event.item.subtitle || 'Texto clínico y de referencia formativa para terapeutas y estudiantes de Plataforma LMS.',
        capitulos: [
          'Capítulo I: Fundamentos y Bases Epistemológicas',
          'Capítulo II: Cartografía y Topografía Anatómica',
          'Capítulo III: Protocolos Terapéuticos y Fichas de Consulta',
          'Capítulo IV: Casos Clínicos y Recomendaciones Terapéuticas'
        ],
        etiquetas: ['Plataforma LMS', 'Publicación Oficial', 'MTC']
      };
      this.openDetails(fallback);
    }
  }

  getGeneralWhatsAppCatalog(): string {
    const text = 'Hola Plataforma LMS, deseo solicitar el catálogo completo de libros y manuales clínicos en PDF.';
    return `https://wa.me/51939371250?text=${encodeURIComponent(text)}`;
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && this.bookshelfSectionRef) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              document.body.classList.add('in-bookshelf-zone');
            } else {
              document.body.classList.remove('in-bookshelf-zone');
            }
          }
        },
        {
          // Activar cuando la sección esté presente en el viewport
          rootMargin: '-60px 0px -60px 0px',
          threshold: 0.1
        }
      );

      this.intersectionObserver.observe(this.bookshelfSectionRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('in-bookshelf-zone');
    }
  }
}

