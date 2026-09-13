import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';
import { ThemeService } from '../../services/theme.service';

interface NavLink {
  label: string;
  route: string;
  ariaLabel: string;
  description: string;
  icon: string;
}

interface NavItem {
  label: string;
  route?: string;
  bgColor: string;
  textColor: string;
  links: NavLink[];
  ctaRoute?: string;
}

@Component({
  selector: 'app-card-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card-nav.component.html',
  styleUrls: ['./card-nav.component.css']
})
export class CardNavComponent implements OnInit, OnDestroy {
  @ViewChild('navbarRef') navbarRef!: ElementRef<HTMLElement>;

  private router = inject(Router);
  themeService = inject(ThemeService);

  activeDropdown: number | null = null;
  isMobileMenuOpen = false;
  activeMobileDropdown: number | null = null;
  currentUrl: string = '';

  private tl: gsap.core.Timeline | null = null;
  private hideTimeout: any = null;
  private routerSub?: Subscription;

  readonly navItems: NavItem[] = [
    {
      label: 'Inicio',
      route: '/inicio',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Cursos Online',
      bgColor: '#1e293b',
      textColor: '#fff',
      ctaRoute: '/cursos-online',
      links: [
        { label: 'Acupuntura China', route: '/cursos/acupuntura-china', ariaLabel: 'Curso de Acupuntura China', description: 'Formación profesional en medicina tradicional', icon: 'spa' },
        { label: 'Electroacupuntura', route: '/cursos/electroacupuntura', ariaLabel: 'Curso de Electroacupuntura', description: 'Seminario clínico con casos reales grabado de 8h', icon: 'bolt' },
        { label: 'Auriculoterapia', route: '/cursos/auriculoterapia', ariaLabel: 'Curso de Auriculoterapia', description: 'Diagnóstico y estímulo del pabellón auricular', icon: 'hearing' },
        { label: 'Masaje Terapéutico', route: '/cursos/masaje-terapeutico', ariaLabel: 'Curso de Masaje Terapéutico', description: 'Técnicas manuales para la salud y bienestar', icon: 'physical_therapy' }
      ]
    },
    {
      label: 'Cursos Presenciales',
      bgColor: '#1e293b',
      textColor: '#fff',
      ctaRoute: '/cursos-presenciales',
      links: [
        { label: 'Digitopresión Mecánica', route: '/cursos/digitopresion-presencial', ariaLabel: 'Curso de Digitopresión', description: 'Técnicas de presión digital terapéutica', icon: 'touch_app' },
        { label: 'Auriculoterapia', route: '/cursos/auriculoterapia-presencial', ariaLabel: 'Curso de Auriculoterapia Presencial', description: 'Diagnóstico y estimulación del pabellón auricular', icon: 'hearing' },
        { label: 'Acupuntura China', route: '/cursos/acupuntura-presencial', ariaLabel: 'Curso de Acupuntura China Presencial', description: 'Formación completa en medicina tradicional china', icon: 'adjust' }
      ]
    },
    {
      label: 'Sedes',
      route: '/sedes',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Certificación',
      route: '/certificacion',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Bolsa de trabajo',
      route: '/bolsa-de-trabajo',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    }
  ];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.currentUrl = this.router.url || window.location.pathname;
      document.addEventListener('click', this.onDocumentClick);
    }

    this.routerSub = this.router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.currentUrl = e.urlAfterRedirects || e.url;
        this.hideDropdown();
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick);
    }
    this.routerSub?.unsubscribe();
    this.tl?.kill();
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (typeof document !== 'undefined') {
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden'; // Prevent scrolling when open
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggleMobileDropdown(index: number): void {
    if (this.activeMobileDropdown === index) {
      this.activeMobileDropdown = null;
    } else {
      this.activeMobileDropdown = index;
    }
  }

  toggleDropdown(index: number): void {
    if (this.activeDropdown === index) {
      this.hideDropdown();
    } else {
      this.showDropdown(index);
    }
  }

  private onDocumentClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (!this.navbarRef?.nativeElement.contains(target)) {
      this.hideDropdown();
    }
  };

  showDropdown(index: number): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.activeDropdown === index) return;

    // Hide previous dropdown first
    if (this.activeDropdown !== null) {
      this.tl?.kill();
      const prevCard = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${this.activeDropdown}"]`);
      if (prevCard) {
        gsap.set(prevCard, { display: 'none' });
      }
    }

    this.activeDropdown = index;
    const card = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${index}"]`) as HTMLElement;
    if (!card) return;

    gsap.set(card, { display: 'flex', y: -10, opacity: 0 });
    this.tl = gsap.timeline();
    this.tl.to(card, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
  }

  hideDropdown(): void {
    if (this.activeDropdown === null) return;

    const card = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${this.activeDropdown}"]`) as HTMLElement;
    if (card) {
      this.tl?.kill();
      this.tl = gsap.timeline();
      this.tl.to(card, {
        y: -10, opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          gsap.set(card, { display: 'none' });
          this.activeDropdown = null;
        }
      });
    } else {
      this.activeDropdown = null;
    }
  }

  scheduleHide(): void {
    this.hideTimeout = setTimeout(() => this.hideDropdown(), 200);
  }

  cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hasActiveRoute(item: NavItem): boolean {
    const rawUrl = this.currentUrl || (typeof window !== 'undefined' ? window.location.pathname : '');
    const url = rawUrl.split('?')[0].split('#')[0];

    if (item.route) {
      if (url === item.route || url === `${item.route}.html` || (item.route !== '/inicio' && url.startsWith(item.route))) {
        return true;
      }
    }
    if (item.ctaRoute && (url === item.ctaRoute || url === `${item.ctaRoute}.html`)) {
      return true;
    }
    if (item.links && item.links.length > 0) {
      return item.links.some(l => url === l.route || url === `${l.route}.html` || (l.route !== '/' && url.startsWith(l.route)));
    }
    return false;
  }

  getLogoSrc(): string {
    return 'assets/plataforma_lms-logo.png';
  }
}
