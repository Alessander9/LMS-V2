import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Curso {
  slug: string;
  title: string;
  category: 'CORTOS' | 'DIPLOMADOS';
  modality: 'ONLINE' | 'PRESENCIAL';
  icon: string;
  rating: number;
  duration: string;
  description: string;
  students: string;
  price: string;
  image: string;
  customLink?: string;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class PublicCursosComponent {
  filter: 'TODOS' | 'CORTOS' | 'DIPLOMADOS' = 'TODOS';
  searchTerm: string = '';
  sortBy: string = 'POPULARIDAD';

  cursos: Curso[] = [
    // 3 Cursos Online (del Navbar)
    {
      slug: 'acupuntura-china-online',
      title: 'Acupuntura China (Online)',
      category: 'DIPLOMADOS',
      modality: 'ONLINE',
      icon: 'spa',
      rating: 4.9,
      duration: 'Online / Acceso virtual',
      description: 'Formación profesional en medicina tradicional china con acceso virtual.',
      students: '+1,200',
      price: 'S/ 180/mes',
      image: 'assets/acupuntura_china_virtual.jpg',
      customLink: '/cursos/acupuntura-china'
    },
    {
      slug: 'auriculoterapia-online',
      title: 'Auriculoterapia (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'hearing',
      rating: 4.9,
      duration: 'Online / Acceso virtual',
      description: 'Diagnóstico, mapeo y estímulo terapéutico del pabellón auricular.',
      students: '+850',
      price: 'S/ 150/mes',
      image: 'assets/auriculoterapia_online.jpg',
      customLink: '/cursos/auriculoterapia'
    },
    {
      slug: 'masaje-terapeutico-online',
      title: 'Masaje Terapéutico (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'physical_therapy',
      rating: 4.8,
      duration: 'Online / Acceso virtual',
      description: 'Técnicas manuales y protocolos clínicos orientados a la salud y bienestar físico.',
      students: '+600',
      price: 'S/ 160/mes',
      image: 'assets/masaje_terapeutico_virtual.jpg',
      customLink: '/cursos/masaje-terapeutico'
    },
    {
      slug: 'paralisis-facial-acupuntura-fisioterapia-online',
      title: 'Parálisis Facial con Acupuntura y Fisioterapia (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'neurology',
      rating: 4.9,
      duration: '2 horas',
      description: 'Taller online para abordar parálisis facial integrando acupuntura, fisioterapia y criterio clínico complementario.',
      students: '+180',
      price: 'S/ 120',
      image: 'assets/paralisis_virtual.jpg',
      customLink: '/cursos/paralisis-facial-acupuntura-fisioterapia-online'
    },
    {
      slug: 'control-peso-auriculoterapia-acupuntura-online',
      title: 'Seminario Internacional de Auriculoterapia',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'hearing',
      rating: 5.0,
      duration: 'Zoom + Presencial',
      description: 'Seminario internacional con Lic. Lázaro Regalado (Cuba) y Emanuel Cabanillas (Perú). Clases en vivo por Zoom y prácticas presenciales. Incluye kit.',
      students: '+280',
      price: 'S/ 280',
      image: 'assets/ficha_curso.jpg',
      customLink: '/cursos/control-peso-auriculoterapia-acupuntura-online'
    },
    {
      slug: 'stretching-terapeutico-online',
      title: 'Stretching Terapéutico (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'self_improvement',
      rating: 4.8,
      duration: '2 horas',
      description: 'Taller online para aplicar movilidad, elongación y criterios de cuidado corporal con enfoque terapéutico.',
      students: '+190',
      price: 'S/ 90',
      image: 'assets/stretching_online.jpg',
      customLink: '/cursos/stretching-terapeutico-online'
    },
    {
      slug: 'acupuntura-estetica-online',
      title: 'Acupuntura Estética (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'face_retouching_natural',
      rating: 4.9,
      duration: '2 horas',
      description: 'Taller online de acupuntura estética para conocer protocolos faciales, seguridad y aplicación profesional.',
      students: '+210',
      price: 'S/ 90',
      image: 'assets/acupuntura_estetica_virtual.jpg',
      customLink: '/cursos/acupuntura-estetica-online'
    },
    {
      slug: 'reflexologia-online',
      title: 'Curso de Reflexología',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'footprint',
      rating: 4.8,
      duration: '2 horas',
      description: 'Curso online de reflexología para aprender una base clara, ordenada y aplicable al bienestar integral.',
      students: '+160',
      price: 'S/ 120',
      image: 'assets/reflexologia_online.jpg',
      customLink: '/cursos/reflexologia-online'
    },
    {
      slug: 'seminario-reflexologia-online',
      title: 'Seminario de Reflexología (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'footprint',
      rating: 4.9,
      duration: 'Clases en vivo',
      description: 'Especialízate en Reflexología Podal con enfoque clínico y su integración con principios de Acupuntura.',
      students: '+120',
      price: 'S/ 150',
      image: 'assets/seminario_reflexologia.jpg',
      customLink: '/cursos/seminario-reflexologia-online'
    },
    {
      slug: 'aromaterapia-flores-bach-online',
      title: 'Aromaterapia y Flores de Bach (Online)',
      category: 'CORTOS',
      icon: 'local_florist',
      modality: 'ONLINE',
      rating: 5.0,
      duration: '1 mes / Clases en vivo',
      description: 'Aprende a integrar el poder de los aceites esenciales y las Flores de Bach en el abordaje de las terapias integrales.',
      students: '+180',
      price: 'S/ 120',
      image: 'assets/curso_aromaterapia_flores_bach.jpg',
      customLink: '/cursos/aromaterapia-flores-bach'
    },
    {
      slug: 'electroacupuntura-online',
      title: 'Electroacupuntura Clínica (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'bolt',
      rating: 4.9,
      duration: '8 horas (Grabado / Inmediato)',
      description: 'Teoría aplicada a la práctica con casos reales durante la formación. Docente: Lic. Lázaro Regalado Ponte.',
      students: '+240',
      price: 'S/ 180',
      image: 'assets/electroAcupuntura_IMG/foto_electro.jpg',
      customLink: '/cursos/electroacupuntura'
    },

    // Cursos Presenciales
    {
      slug: 'digitopresion-presencial',
      title: 'Digitopresión Mecánica',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'touch_app',
      rating: 4.9,
      duration: '2 meses',
      description: 'Aprende técnicas de presión digital terapéutica para tratar contracturas, puntos gatillo y dolor musculoesquelético con seguridad clínica.',
      students: '+320',
      price: 'S/ 260/mes',
      image: 'assets/digitopresion_presencial.jpg',
      customLink: '/cursos/digitopresion-presencial'
    },
    {
      slug: 'auriculoterapia-presencial',
      title: 'Auriculoterapia Presencial',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'hearing',
      rating: 4.9,
      duration: '2 meses',
      description: 'Domina el diagnóstico y la estimulación del pabellón auricular con técnicas orientales y occidentales para resultados clínicos reales.',
      students: '+450',
      price: 'S/ 260/mes',
      image: 'assets/curso_auriculoterapia_presencial.jpg',
      customLink: '/cursos/auriculoterapia-presencial'
    },
    {
      slug: 'acupuntura-china-7-meses',
      title: 'Acupuntura China (7 meses)',
      category: 'DIPLOMADOS',
      modality: 'PRESENCIAL',
      icon: 'adjust',
      rating: 4.9,
      duration: '7 meses',
      description: 'Formación profesional intensiva para dominar los principios de la Medicina Tradicional China y aprender la práctica clínica de la acupuntura.',
      students: '+150',
      price: 'S/ 150/mes',
      image: 'assets/acupuntura_7meses_presencial.jpg',
      customLink: '/cursos/acupuntura-china-7-meses'
    },
    {
      slug: 'acupuntura-presencial',
      title: 'Acupuntura China (12 meses)',
      category: 'DIPLOMADOS',
      modality: 'PRESENCIAL',
      icon: 'adjust',
      rating: 5.0,
      duration: '12 meses',
      description: 'Especialízate con la formación presencial más completa en medicina tradicional china, moxibustión y microsistemas con práctica clínica supervisada.',
      students: '+600',
      price: 'S/ 270/mes',
      image: 'assets/acupuntura_china_presencial.jpg',
      customLink: '/cursos/acupuntura-presencial'
    },
    {
      slug: 'dietetica-presencial',
      title: 'Dietética y Nutrición Energética',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'nutrition',
      rating: 4.8,
      duration: '1 mes',
      description: 'Aprende a evaluar el estado nutricional y diseñar planes dietéticos terapéuticos para las condiciones de salud más frecuentes.',
      students: '+210',
      price: 'S/ 250/mes',
      image: 'assets/curso_dietetica.jpg',
      customLink: '/cursos/dietetica-presencial'
    },
    {
      slug: 'fitoterapia-presencial',
      title: 'Fitoterapia y Plantas Medicinales',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'local_pharmacy',
      rating: 4.9,
      duration: '1 mes',
      description: 'Aprende el uso terapéutico de las plantas medicinales de forma segura, práctica y basada en la evidencia científica.',
      students: '+180',
      price: 'S/ 250/mes',
      image: 'assets/fitoterapia_plataforma_lms.jpg',
      customLink: '/cursos/fitoterapia-presencial'
    },
    {
      slug: 'aromaterapia-flores-bach',
      title: 'Aromaterapia y Flores de Bach',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'local_florist',
      rating: 5.0,
      duration: '1 mes / Presencial',
      description: 'Aprende a integrar el poder de los aceites esenciales y las Flores de Bach en el abordaje clínico de las terapias integrales.',
      students: '+160',
      price: 'S/ 200',
      image: 'assets/curso_aromaterapia_flores_bach.jpg',
      customLink: '/cursos/aromaterapia-flores-bach'
    },
    {
      slug: 'acupuntura-estetica-presencial',
      title: 'Acupuntura Estética Facial',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'face_retouching_natural',
      rating: 4.9,
      duration: '1 mes / Presencial',
      description: 'Técnicas presenciales de lifting facial bioenergético, microagujas intradérmicas y rejuvenecimiento cutáneo.',
      students: '+190',
      price: 'S/ 260/mes',
      image: 'assets/acupuntura_estetica_virtual.jpg',
      customLink: '/cursos/acupuntura-estetica-presencial'
    },
    {
      slug: 'moxibustion-ventosas-presencial',
      title: 'Moxibustión y Ventosaterapia',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'local_fire_department',
      rating: 4.9,
      duration: 'Full Day / Presencial',
      description: 'Taller presencial intensivo de moxibustión directa/indirecta y ventosas de cristal y neumáticas.',
      students: '+240',
      price: 'S/ 220',
      image: 'assets/curso_moxi_index.jpg',
      customLink: '/cursos/moxibustion-ventosas-presencial'
    },
    {
      slug: 'paralisis-facial-presencial',
      title: 'Tratamiento de Parálisis Facial',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'neurology',
      rating: 4.9,
      duration: '1 mes / Presencial',
      description: 'Abordaje clínico de la parálisis facial periférica combinando acupuntura, electroestimulación y masaje neuromuscular.',
      students: '+170',
      price: 'S/ 240',
      image: 'assets/paralisis_virtual.jpg',
      customLink: '/cursos/paralisis-facial-presencial'
    },
    {
      slug: 'reflexologia-podal-presencial',
      title: 'Reflexología Podal Clínica',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'footprint',
      rating: 4.8,
      duration: '1 mes / Presencial',
      description: 'Cartografía podal completa, maniobras neuroreflejas de presión y secuencias para regulación del estrés.',
      students: '+210',
      price: 'S/ 230',
      image: 'assets/reflexologia_img_curso.jpg',
      customLink: '/cursos/reflexologia-podal-presencial'
    },
    {
      slug: 'stretching-terapeutico-presencial',
      title: 'Stretching Terapéutico y Movilidad',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'self_improvement',
      rating: 4.8,
      duration: '1 mes / Presencial',
      description: 'Elongación asistida, descompresión articular y reeducación postural aplicadas a fisioterapia y masaje.',
      students: '+180',
      price: 'S/ 200',
      image: 'assets/stretching_online.jpg',
      customLink: '/cursos/stretching-terapeutico-presencial'
    },
    {
      slug: 'masaje-terapeutico',
      title: 'Masaje Terapéutico Integral',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'physical_therapy',
      rating: 4.9,
      duration: '2 meses / Presencial',
      description: 'Técnicas profundas de masaje descontracturante, drenaje y liberación miofascial en camilla clínica.',
      students: '+350',
      price: 'S/ 260/mes',
      image: 'assets/curso_masaje_digitopresion.jpg',
      customLink: '/cursos/masaje-terapeutico'
    }
  ];

  setFilter(f: 'TODOS' | 'CORTOS' | 'DIPLOMADOS') {
    this.filter = f;
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onSort(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
  }

  getOnlineCursos() {
    return this.filteredCursos().filter(c => c.modality === 'ONLINE');
  }

  getPresencialCursos() {
    return this.filteredCursos().filter(c => c.modality === 'PRESENCIAL');
  }

  filteredCursos() {
    let list = this.cursos;

    // Filter by category
    if (this.filter !== 'TODOS') {
      list = list.filter(c => c.category === this.filter);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(c => c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
    }

    // Sort
    if (this.sortBy === 'PRECIO_ASC') {
      list = [...list].sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
    } else if (this.sortBy === 'PRECIO_DESC') {
      list = [...list].sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
    }

    return list;
  }

  private parsePrice(priceStr: string): number {
    return parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  }
}
