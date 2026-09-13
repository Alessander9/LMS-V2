import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-acupuntura-estetica-presencial',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './acupuntura-estetica-presencial.component.html',
  styleUrls: ['./acupuntura-estetica-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaEsteticaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Bloque 1',
      icon: 'face',
      title: 'Comprende la anatomía y energía del rostro',
      description: 'Estudia los meridianos faciales, la irrigación sanguínea y los principios energéticos que gobiernan la estética facial.',
      outcomes: ['Meridianos faciales', 'Diagnóstico energético', 'Anatomía estética']
    },
    {
      shortTitle: 'Técnica',
      period: 'Bloque 2',
      icon: 'medical_services',
      title: 'Domina las técnicas de estimulación facial',
      description: 'Aprende acupuntura intradérmica, mini ventosas faciales, gua sha y moxibustión indirecta para el rejuvenecimiento.',
      outcomes: ['Microagujas faciales', 'Mini ventosas', 'Gua sha terapéutico']
    },
    {
      shortTitle: 'Protocolos',
      period: 'Bloque 3',
      icon: 'auto_awesome',
      title: 'Integra protocolos estéticos completos',
      description: 'Combina todas las técnicas en una secuencia profesional para tratamientos de rejuvenecimiento facial.',
      outcomes: ['Secuencia completa', 'Caso clínico guiado', 'Certificación Plataforma LMS']
    }
  ];

  constructor(private readonly host: ElementRef<HTMLElement>) {}

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
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }

    openBenefitLightbox(): void {
    const images = [
      'https://images.unsplash.com/photo-1589330694653-ded6df53f7ee?auto=format&fit=crop&w=600&q=70',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=70',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=70'
    ];
    this.benefitLightboxImage = images[this.activeBenefitIndex];
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
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    this.animationContext = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      hero
        .from('.ac-kicker', { opacity: 0, y: -12, duration: 0.45 })
        .from('.ac-title', { opacity: 0, y: 28, duration: 0.8 }, '-=0.2')
        .from('.ac-description, .ac-actions, .ac-proof', { opacity: 0, y: 14, stagger: 0.08, duration: 0.45 }, '-=0.45')
        .from('.ac-hero__visual', { opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.65')
        .from('.ac-fact', { opacity: 0, y: 12, stagger: 0.07, duration: 0.4 }, '-=0.4');

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

    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
