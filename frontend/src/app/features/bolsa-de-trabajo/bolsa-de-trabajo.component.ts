import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

export interface Trabajo {
  id: string;
  empresa: string;
  puesto: string;
  ubicacion: string;
  ubicacionCorta: 'CUSCO' | 'AMAZONIA' | 'LIMA';
  tipoContrato: string;
  imagen: string;
  imagenAlt: string;
  tagline: string;
  destacado?: boolean;
  informacionGeneral: {
    hotel?: string;
    puesto: string;
    ubicacionDetalle: string;
  };
  requisitos: string[];
  funciones: string[];
  beneficios: string[];
  turnos?: string[];
  contacto: {
    whatsapp: string;
    whatsappNumero: string;
    email?: string;
  };
}

@Component({
  selector: 'app-bolsa-de-trabajo',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './bolsa-de-trabajo.component.html',
  styleUrls: ['./bolsa-de-trabajo.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BolsaDeTrabajoComponent implements OnInit {
  filtroUbicacion: 'TODOS' | 'CUSCO' | 'AMAZONIA' | 'LIMA' = 'TODOS';
  busqueda: string = '';
  trabajoSeleccionadoModal: Trabajo | null = null;
  imagenLightbox: string = '';
  showLightbox: boolean = false;

  trabajos: Trabajo[] = [
    {
      id: 'inkaterra-cusco',
      empresa: 'Inkaterra - Cusco',
      puesto: 'Terapeuta / Masajista de Spa',
      ubicacion: 'Machu Picchu, Cusco',
      ubicacionCorta: 'CUSCO',
      tipoContrato: 'Régimen 24x4 · Todo incluido',
      imagen: 'assets/inkaterra_2.jpg',
      imagenAlt: 'Inkaterra Machu Picchu Pueblo Hotel - Terapeuta de Spa',
      tagline: 'Hotel boutique y spa de lujo en el santuario de Machu Picchu',
      destacado: true,
      informacionGeneral: {
        hotel: 'Inkaterra Machu Picchu Pueblo Hotel (Perú)',
        puesto: 'Terapeuta / Masajista de Spa',
        ubicacionDetalle: 'Machu Picchu, Cusco'
      },
      requisitos: [
        'Tener formación técnica o certificación en Terapias de Masajes o afines.',
        'Contar con una experiencia mínima de 1 año en terapias corporales y de bienestar.',
        'Conocimiento en masajes relajantes, descontracturantes, aromaterapia y tratamientos faciales (deseable).',
        'Disponibilidad para trabajar en horarios rotativos y vocación de servicio con excelente atención al cliente.'
      ],
      beneficios: [
        'Alojamiento y alimentación completa incluidos durante tu estancia.',
        'Régimen laboral: 24x4 (24 días de trabajo por 4 días de descanso).',
        'Formar parte de una de las cadenas hoteleras ecológicas más prestigiosas del mundo.',
        'Excelente clima laboral y oportunidades de desarrollo en turismo de bienestar.'
      ],
      funciones: [
        'Brindar terapias y tratamientos de bienestar siguiendo los estándares internacionales del spa.',
        'Orientar y asesorar a los huéspedes sobre los servicios y protocolos disponibles.',
        'Preparar y mantener en óptimas condiciones las cabinas, equipos, aceites e insumos.',
        'Garantizar una experiencia excepcional y cumplir con todos los protocolos de higiene, bioseguridad y calidad.'
      ],
      contacto: {
        whatsappNumero: '982 353 066',
        whatsapp: 'https://wa.me/51982353066?text=Hola%2C%20vengo%20de%20la%20bolsa%20de%20trabajo%20de%20Plataforma LMS%20para%20postular%20al%20puesto%20de%20Terapeuta%20de%20Spa%20en%20Inkaterra%20Cusco',
        email: 'clarit.quispe@inkaterra.com'
      }
    },
    {
      id: 'inkaterra-amazonia',
      empresa: 'Inkaterra - Tambopata',
      puesto: 'Masajista de Bienestar',
      ubicacion: 'Puerto Maldonado (Amazonía)',
      ubicacionCorta: 'AMAZONIA',
      tipoContrato: 'Régimen Albergue · Alojamiento + Alimentación',
      imagen: 'assets/inkaterra_1.jpg',
      imagenAlt: 'Inkaterra Hacienda Concepción Tambopata - Masajista',
      tagline: 'Albergue exclusivo en el corazón de la selva amazónica de Tambopata',
      destacado: false,
      informacionGeneral: {
        hotel: 'Inkaterra Hacienda Concepción (Tambopata, Perú)',
        puesto: 'Masajista',
        ubicacionDetalle: 'Puerto Maldonado (Albergue en el corazón de la Amazonía)'
      },
      requisitos: [
        'Tener estudios técnicos o certificaciones en masoterapia, terapias corporales o carreras afines.',
        'Contar con una experiencia mínima de 1 año en spas, hoteles de lujo o centros de bienestar.',
        'Conocimiento de diferentes técnicas de masaje (relajante, descontracturante, piedras calientes, aromaterapias, etc.).',
        'Dominio del idioma inglés a nivel intermedio - avanzado (trato directo con turistas internacionales).',
        'Excelente comunicación, trabajo en equipo y disponibilidad inmediata para laborar en el albergue.'
      ],
      beneficios: [
        'Ser parte de una empresa líder y reconocida mundialmente en el sector de ecoturismo y hotelería.',
        'Alojamiento y alimentación totalmente cubiertos durante el régimen de trabajo.',
        'Remuneración competitiva acorde a la experiencia y habilidades del candidato.',
        'Experiencia única de vida y desarrollo profesional en la Amazonía peruana.'
      ],
      funciones: [
        'Realizar tratamientos corporales, terapias holísticas y masajes según los protocolos del SPA.',
        'Brindar atención cálida, amable, personalizada y con alto estándar profesional al huésped.',
        'Preparar y mantener en óptimas condiciones las cabinas, equipos, camillas e insumos.',
        'Promover activamente los servicios y rituales de bienestar del SPA.',
        'Cumplir estrictamente con los protocolos de seguridad, higiene, cuidado ambiental y calidad.'
      ],
      contacto: {
        whatsappNumero: '982 353 066',
        whatsapp: 'https://wa.me/51982353066?text=Hola%2C%20vengo%20de%20la%20bolsa%20de%20trabajo%20de%20Plataforma LMS%20para%20postular%20al%20puesto%20de%20Masajista%20en%20Inkaterra%20Hacienda%20Concepci%C3%B3n',
        email: 'clarit.quispe@inkaterra.com'
      }
    },
    {
      id: 'equilibrio-center-lima',
      empresa: 'Equilibrio Wellness Center',
      puesto: 'Fisioterapeuta (Dirigido a mujer)',
      ubicacion: 'Miraflores / Lima',
      ubicacionCorta: 'LIMA',
      tipoContrato: 'Medio Tiempo / Full Time',
      imagen: 'assets/Equilibrio_Center.jpg',
      imagenAlt: 'Equilibrio Wellness Center - Fisioterapeuta en Lima',
      tagline: 'Centro especializado de rehabilitación, bienestar y estética integral',
      destacado: true,
      informacionGeneral: {
        hotel: 'Equilibrio Wellness Center',
        puesto: 'Fisioterapeuta (puesto dirigido a mujer)',
        ubicacionDetalle: 'Lima (Zona Miraflores / Centro de Bienestar)'
      },
      requisitos: [
        'Experiencia comprobable en masajes terapéuticos y rehabilitación física.',
        'Conocimiento y manejo de drenaje linfático manual y terapia con ventosas.',
        'Manejo de agentes físicos (ultrasonido, corrientes terapéuticas, termoterapia, crioterapia, etc.).',
        'Aplicación de punción seca y abordaje de puntos gatillo miofasciales.',
        'Capacidad para realizar evaluación fisioterapéutica y diseñar planes de tratamiento personalizados.',
        'Valores esenciales: compromiso, empatía, profesionalismo, puntualidad y trabajo en equipo.'
      ],
      beneficios: [
        'Un ambiente armónico, profesional y con excelente clima laboral.',
        'Crecimiento profesional continuo con acompañamiento técnico.',
        'Capacitaciones y actualización constante en nuevas terapias.',
        'Instalaciones modernas con tecnología de vanguardia en fisioterapia y spa.'
      ],
      turnos: [
        'Medio Tiempo: 2:00 PM – 8:00 PM (Lunes a Sábado)',
        'Full Time: 11:00 AM – 8:00 PM (Lunes a Sábado)'
      ],
      funciones: [
        'Evaluación integral y ejecución de planes fisioterapéuticos y de masoterapia.',
        'Aplicación de agentes físicos, drenaje linfático, ventosas y punción seca.',
        'Atención personalizada orientada al alivio del dolor y la recuperación funcional.',
        'Seguimiento a la evolución del paciente y registro de sesiones clínicas.'
      ],
      contacto: {
        whatsappNumero: '993 408 856',
        whatsapp: 'https://wa.me/51993408856?text=Hola%2C%20vengo%20de%20la%20bolsa%20de%20trabajo%20de%20Plataforma LMS%20para%20postular%20al%20puesto%20de%20Fisioterapeuta%20en%20Equilibrio%20Wellness%20Center'
      }
    }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  get trabajosFiltrados(): Trabajo[] {
    return this.trabajos.filter(t => {
      const coincideUbicacion = this.filtroUbicacion === 'TODOS' || t.ubicacionCorta === this.filtroUbicacion;
      const term = this.busqueda.toLowerCase().trim();
      const coincideBusqueda = !term ||
        t.empresa.toLowerCase().includes(term) ||
        t.puesto.toLowerCase().includes(term) ||
        t.ubicacion.toLowerCase().includes(term) ||
        t.requisitos.some(r => r.toLowerCase().includes(term));

      return coincideUbicacion && coincideBusqueda;
    });
  }

  setFiltro(ubicacion: 'TODOS' | 'CUSCO' | 'AMAZONIA' | 'LIMA') {
    this.filtroUbicacion = ubicacion;
  }

  abrirLightbox(img: string) {
    this.imagenLightbox = img;
    this.showLightbox = true;
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarLightbox() {
    this.showLightbox = false;
    this.imagenLightbox = '';
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
