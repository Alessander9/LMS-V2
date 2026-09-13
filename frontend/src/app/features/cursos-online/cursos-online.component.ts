import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Curso {
  slug: string;
  title: string;
  category: 'CORTOS' | 'DIPLOMADOS';
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
  selector: 'app-cursos-online',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos-online.component.html',
  styleUrls: ['./cursos-online.component.css']
})
export class CursosOnlineComponent {
  filter: 'TODOS' | 'CORTOS' | 'DIPLOMADOS' = 'TODOS';
  searchTerm: string = '';
  sortBy: string = 'POPULARIDAD';

  cursos: Curso[] = [
    {
      slug: 'acupuntura-china-online',
      title: 'Acupuntura China (Online)',
      category: 'DIPLOMADOS',
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
      icon: 'bolt',
      rating: 4.9,
      duration: '8 horas (Grabado / Inmediato)',
      description: 'Teoría aplicada a la práctica con casos reales durante la formación. Docente: Lic. Lázaro Regalado Ponte.',
      students: '+240',
      price: 'S/ 180',
      image: 'assets/electroAcupuntura_IMG/foto_electro.jpg',
      customLink: '/cursos/electroacupuntura'
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

  filteredCursos() {
    let list = this.cursos;

    if (this.filter !== 'TODOS') {
      list = list.filter(c => c.category === this.filter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

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
