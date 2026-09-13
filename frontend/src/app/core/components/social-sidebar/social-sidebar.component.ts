import { Component, AfterViewInit, OnDestroy, ElementRef, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-social-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-sidebar.component.html',
  styleUrls: ['./social-sidebar.component.css']
})
export class SocialSidebarComponent implements AfterViewInit, OnDestroy {

  socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/51939371250',
      iconClass: 'bg-[#25D366]/10 border-[#25D366]/20 hover:bg-[#25D366]',
      shadowClass: 'hover:shadow-[#25D366]/20',
      svgPath: 'M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.352 4.978L2 22l5.176-1.356a9.923 9.923 0 004.833 1.258h.005c5.505 0 9.988-4.478 9.99-9.984A9.99 9.99 0 0012.012 2zm5.733 14.174c-.234.659-1.358 1.258-1.87 1.309-.465.045-.927.241-2.98-.567-2.628-1.034-4.298-3.708-4.43-3.882-.132-.174-1.066-1.418-1.066-2.704 0-1.287.674-1.92.915-2.181.242-.261.528-.326.704-.326.176 0 .352.002.506.01.16.008.375-.061.587.45.22.529.749 1.83.815 1.961.066.131.11.283.022.46-.088.177-.132.287-.264.441-.132.155-.278.347-.396.463-.132.13-.27.272-.116.536.154.264.684 1.13 1.47 1.83.997.89 1.834 1.164 2.098 1.295.264.131.418.11.572-.066.154-.176.66-.767.836-1.029.176-.261.352-.218.594-.127.242.091 1.54.726 1.804.858.264.131.44.195.506.308.066.113.066.659-.168 1.318z'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/Plataforma LMS',
      iconClass: 'bg-[#1877F2]/10 border-[#1877F2]/20 hover:bg-[#1877F2]',
      shadowClass: 'hover:shadow-[#1877F2]/20',
      svgPath: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/institutodeterapias/?hl=es%20Plataforma LMS',
      iconClass: 'bg-[#E1306C]/10 border-[#E1306C]/20 hover:bg-[#E1306C]',
      shadowClass: 'hover:shadow-[#E1306C]/20',
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@Plataforma LMSperucursosterapiasc4318',
      iconClass: 'bg-[#FF0000]/10 border-[#FF0000]/20 hover:bg-[#FF0000]',
      shadowClass: 'hover:shadow-[#FF0000]/20',
      svgPath: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
    },
    {
      name: 'TikTok',
      iconClass: 'bg-[#010101]/10 border-[#010101]/20 hover:bg-[#010101]',
      shadowClass: 'hover:shadow-[#010101]/20',
      url: 'https://www.tiktok.com/@terapias.integrales',
      svgPath: 'M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.67c-3.45-.57-6.12 2.11-6.12 5.18 0 2.69 2.18 4.88 4.88 4.88 2.69 0 4.88-2.19 4.88-4.88V7.43c1.28.84 2.89 1.33 4.62 1.33V5.55c-1.42 0-2.68-1.07-3.45-2.73z'
    }
  ];

  private readonly HIDDEN_ROUTES = ['/login', '/dashboard', '/exp-final'];
  /** Píxeles mínimos de scroll para considerar mobile (breakpoint ≤767px) */
  private readonly MOBILE_BREAKPOINT = 767;
  /** Umbral mínimo de px scrolleados antes de ejecutar auto-hide en mobile */
  private readonly SCROLL_DELTA_THRESHOLD = 40;

  private sidebarEl: HTMLElement | null = null;
  private listenerAttached = false;
  private resizeListenerAttached = false;
  private routerSubscription?: import('rxjs').Subscription;

  /** true si el viewport actual es mobile */
  private isMobile = false;
  /** Última posición Y registrada del scroll (para calcular dirección) */
  private lastScrollY = 0;
  /** Dirección del último scroll: 'down' | 'up' */
  private scrollDirection: 'down' | 'up' = 'up';
  /** Acumulador de delta de scroll para evitar micro-cambios */
  private scrollDelta = 0;
  /** true si la sidebar debe mostrarse según las condiciones de hero/footer */
  private shouldBeVisible = false;
  /**
   * true si la sidebar YA estuvo visible al menos una vez en la zona de contenido.
   * Evita que el auto-hide por scroll-down se active en el primer ingreso a la zona.
   */
  private wasVisible = false;

  private router = inject(Router);

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkRouteAndInit();
      }
    });
  }

  ngAfterViewInit(): void {
    this.checkRouteAndInit();
  }

  private checkRouteAndInit(): void {
    const path = window.location.pathname;
    this.sidebarEl = this.elRef.nativeElement.querySelector('.sidebar-container');
    if (this.HIDDEN_ROUTES.some(route => path.startsWith(route))) {
      if (this.sidebarEl) {
        this.sidebarEl.style.display = 'none';
        this.sidebarEl.style.opacity = '0';
        this.sidebarEl.style.pointerEvents = 'none';
      }
      return;
    }

    if (!this.sidebarEl) return;
    this.sidebarEl.style.display = '';

    this.isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
    this.lastScrollY = window.scrollY;
    this.updateSidebarVisibility();
    this.attachScrollListener();
    this.attachResizeListener();
  }

  ngOnDestroy(): void {
    this.listenerAttached = false;
    this.resizeListenerAttached = false;
    this.routerSubscription?.unsubscribe();
  }

  // ─── Listeners ────────────────────────────────────────────────────────────

  private attachScrollListener(): void {
    if (this.listenerAttached) return;
    this.listenerAttached = true;
    window.addEventListener('scroll', () => {
      this.updateScrollDirection();
      this.updateSidebarVisibility();
    }, { passive: true });
  }

  private attachResizeListener(): void {
    if (this.resizeListenerAttached) return;
    this.resizeListenerAttached = true;
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
      // Si cambió el modo, resetear estilos y recalcular
      if (wasMobile !== this.isMobile) {
        this.resetSidebarStyles();
        this.updateSidebarVisibility();
      }
    }, { passive: true });
  }

  // ─── Dirección de scroll ───────────────────────────────────────────────────

  private updateScrollDirection(): void {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;

    // Acumular delta para evitar reaccionar a micro-scrolls
    this.scrollDelta += delta;

    if (Math.abs(this.scrollDelta) >= this.SCROLL_DELTA_THRESHOLD) {
      this.scrollDirection = this.scrollDelta > 0 ? 'down' : 'up';
      this.scrollDelta = 0;
    }

    this.lastScrollY = currentScrollY;
  }

  // ─── Visibilidad principal ─────────────────────────────────────────────────

  private updateSidebarVisibility(): void {
    if (!this.sidebarEl) return;

    const scrollY     = window.scrollY || window.pageYOffset;
    const scrollBottom = window.innerHeight + scrollY;
    const heroBottom  = this.getHeroBottom();
    const footerTop   = this.getFooterTop();

    const hideByHero   = scrollBottom <= heroBottom;
    const hideByFooter = footerTop > 0 && scrollBottom >= footerTop - 80;

    this.shouldBeVisible = !hideByHero && !hideByFooter;

    if (this.isMobile) {
      this.applyMobileVisibility();
    } else {
      this.applyDesktopVisibility();
    }
  }

  // ─── Desktop: slide desde la izquierda (comportamiento original) ───────────

  private applyDesktopVisibility(): void {
    if (!this.sidebarEl) return;
    if (this.shouldBeVisible) {
      this.sidebarEl.style.left    = '0';
      this.sidebarEl.style.opacity = '1';
      this.sidebarEl.style.pointerEvents = 'auto';
      // Limpiar estilos mobile si los hubiera
      this.sidebarEl.style.transform = '';
      this.sidebarEl.style.bottom    = '';
    } else {
      this.sidebarEl.style.left    = '-90px';
      this.sidebarEl.style.opacity = '0';
      this.sidebarEl.style.pointerEvents = 'none';
    }
  }

  // ─── Mobile: pill horizontal centrada, auto-hide por dirección de scroll ───

  private applyMobileVisibility(): void {
    if (!this.sidebarEl) return;

    if (!this.shouldBeVisible) {
      // Salió de la zona de contenido (hero o footer) → ocultar y resetear
      this.wasVisible = false;
      this.sidebarEl.style.transform     = 'translateX(-50%) translateY(120px)';
      this.sidebarEl.style.opacity        = '0';
      this.sidebarEl.style.pointerEvents  = 'none';
      return;
    }

    // Primera vez que entra a la zona de contenido (cruza el hero hacia abajo):
    // mostrar SIEMPRE independientemente de la dirección de scroll.
    if (!this.wasVisible) {
      this.wasVisible = true;
      this.showMobilePill();
      return;
    }

    // Ya estuvo visible → aplicar auto-hide inteligente:
    // Ocultar temporalmente al scrollear hacia abajo, mostrar al subir.
    if (this.scrollDirection === 'down' && window.scrollY > 150) {
      this.sidebarEl.style.transform     = 'translateX(-50%) translateY(120px)';
      this.sidebarEl.style.opacity        = '0';
      this.sidebarEl.style.pointerEvents  = 'none';
      return;
    }

    // Scroll hacia arriba (o sin movimiento suficiente) → mostrar
    this.showMobilePill();
  }

  /** Aplica los estilos de pill visible (reutilizable) */
  private showMobilePill(): void {
    if (!this.sidebarEl) return;
    this.sidebarEl.style.left           = '50%';
    this.sidebarEl.style.transform      = 'translateX(-50%) translateY(0)';
    this.sidebarEl.style.opacity         = '1';
    this.sidebarEl.style.pointerEvents   = 'auto';
  }

  // ─── Reset al cambiar de modo (resize) ────────────────────────────────────

  private resetSidebarStyles(): void {
    if (!this.sidebarEl) return;
    this.sidebarEl.style.left          = '';
    this.sidebarEl.style.opacity       = '0';
    this.sidebarEl.style.transform     = '';
    this.sidebarEl.style.bottom        = '';
    this.sidebarEl.style.pointerEvents = 'none';
    this.scrollDelta  = 0;
    this.wasVisible   = false;   // resetear para que el primer ingreso vuelva a mostrarse
  }

  // ─── Helpers: hero y footer ────────────────────────────────────────────────

  private getHeroBottom(): number {
    const hero = document.querySelector('main > header, hero, .hero, .hero-section') as HTMLElement | null;
    if (hero) return hero.getBoundingClientRect().bottom + window.scrollY;
    return window.innerHeight;
  }

  private getFooterTop(): number {
    const footer = document.querySelector('footer, .site-footer, app-footer') as HTMLElement | null;
    if (footer) return footer.getBoundingClientRect().top + window.scrollY;
    return 0;
  }
}
