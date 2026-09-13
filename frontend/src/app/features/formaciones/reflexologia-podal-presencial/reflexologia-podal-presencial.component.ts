import { Component, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-reflexologia-podal-presencial',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './reflexologia-podal-presencial.component.html',
  styleUrls: ['./reflexologia-podal-presencial.component.css']
})
export class ReflexologiaPodalPresencialComponent implements AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  activeTab: 't1' | 't2' | 't3' | 't4' = 't1';
  setTab(t: 't1' | 't2' | 't3' | 't4') {
    this.activeTab = t;
  }

  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  prevBenefit() {
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }
  nextBenefit() {
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }
  setBenefit(i: number) {
    this.activeBenefitIndex = i;
  }

    openBenefitLightbox(): void {
    const images = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=70',
      'https://images.unsplash.com/photo-1589330694653-ded6df53f7ee?auto=format&fit=crop&w=600&q=70',
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

  ngAfterViewInit() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.animationContext = gsap.context(() => {
      if (reduceMotion) {
        return;
      }

      gsap.from('.hero-title', {
        opacity: 0,
        y: 18,
        duration: 0.65,
        ease: 'power2.out'
      });

      gsap.from('.hero-desc, .hero-actions, .hero-specs', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.12
      });

      gsap.from('.hero-diptych', {
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        delay: 0.12
      });

      gsap.utils.toArray<HTMLElement>('.acu-section').forEach((section) => {
        if (section.classList.contains('acu-section--audience') || section.classList.contains('acu-section--benefits')) {
          return;
        }

        const intro = section.querySelector('.acu-section__intro, .acu-section__heading');
        const items = section.querySelectorAll('.audience-item, .acu-phase-panel > div:first-child + div > div');

        if (intro) {
          gsap.from(intro, {
            scrollTrigger: {
              trigger: section,
              start: 'top 82%',
              once: true
            },
            opacity: 0,
            y: 24,
            duration: 0.85,
            ease: 'power3.out'
          });
        }

        if (items.length) {
          gsap.from(items, {
            scrollTrigger: {
              trigger: section,
              start: 'top 76%',
              once: true
            },
            opacity: 0,
            y: 18,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power3.out'
          });
        }
      });

      gsap.from('.cta-block', {
        scrollTrigger: {
          trigger: '.cta-block',
          start: 'top 86%',
          once: true
        },
        opacity: 0,
        y: 26,
        duration: 1,
        ease: 'power3.out'
      });
    }, this.host.nativeElement);

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
  }

  ngOnDestroy() {
    this.animationContext?.revert();
  }
}
