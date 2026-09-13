import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Slide {
  pill?: string;
  pillIcon?: string;
  headline: string;
  headlineHighlights?: { text: string; color: string }[];
  description: string;
  cta?: { text: string; link: string; primary?: boolean }[];
  image?: string;
  imageLabel?: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy, AfterViewInit {
  currentSlide = 0;
  private intervalId: any;

  // Modal de video de bienvenida
  showVideoModal = true;
  videoUrl: SafeResourceUrl;
  private readonly YOUTUBE_VIDEO_ID = 'Jzg9ws_HzkE';
  private sanitizer = inject(DomSanitizer);

  constructor() {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`
    );
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const shown = sessionStorage.getItem('Plataforma LMS-welcome-modal-shown');
      if (shown) {
        this.showVideoModal = false;
      } else {
        sessionStorage.setItem('Plataforma LMS-welcome-modal-shown', 'true');
      }
    }
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    // Detener el video al cerrar limpiando la URL
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  slides: Slide[] = [
    {
      pill: 'Plataforma LMS — Instituto de Terapias Integrales',
      pillIcon: 'school',
      headline: 'CURSOS ONLINE DE TERAPIAS COMPLEMENTARIAS CON RESPALDO INTERNACIONAL',
      description: 'Más de 500 terapeutas ya obtuvieron su certificado con respaldo internacional. Estudia desde casa y transforma tu carrera profesional.',
      cta: [
        { text: 'Explorar Cursos', link: '/cursos', primary: true },
        { text: 'Iniciar Sesión', link: '/login', primary: false }
      ],
      image: 'assets/index_hero_1.jpg',
      imageLabel: 'LÁMINA 01 / ECOESFERA DE ESTUDIOS'
    },
    {
      pill: 'Formaciones Especializadas',
      pillIcon: 'local_hospital',
      headline: 'ACUPUNTURA · AURICULOTERAPIA · MASAJE TERAPÉUTICO',
      description: 'Programas completos diseñados por profesionales con más de 15 años de experiencia. Aprende técnicas ancestrales y modernas.',
      cta: [
        { text: 'Ver Programas', link: '/programas', primary: true },
        { text: 'Acupuntura', link: '/cursos/acupuntura-china', primary: false }
      ],
      image: 'assets/index_hero_2.jpg',
      imageLabel: 'LÁMINA 02 / PRÁCTICA CLÍNICA'
    },
    {
      pill: 'Certificación y Respaldo',
      pillIcon: 'workspace_premium',
      headline: 'CERTIFICACIÓN CON RESPALDO INTERNACIONAL',
      description: 'Obtén un certificado digital con respaldo internacional',
      cta: [
        { text: 'Más Información', link: '/certificacion', primary: true },
        { text: 'Validar Certificado', link: '/certificados/validar', primary: false }
      ],
      image: 'assets/index_hero_3.jpg',
      imageLabel: 'LÁMINA 03 / ACREDITACIÓN GLOBAL'
    },
    {
      pill: 'Comunidad Plataforma LMS',
      pillIcon: 'diversity_3',
      headline: '+1000 TERAPEUTAS YA CONFÍAN EN NOSOTROS',
      description: 'Únete a una comunidad de profesionales que transforman vidas a través de las terapias complementarias. 100% online, 100% flexible.',
      cta: [
        { text: 'Comenzar Ahora', link: '/cursos', primary: true },
        { text: 'Saber Más', link: '/por-que-elegirnos', primary: false }
      ],
      image: 'assets/index_hero_4.jpg',
      imageLabel: 'LÁMINA 04 / CONEXIÓN COMUNITARIA'
    }
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetAutoPlay();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 6000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => observer.observe(item));
    }
  }
}
