import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="scroll-to-top-btn"
      [class.visible]="isVisible"
      (click)="scrollToTop()"
      aria-label="Volver al inicio">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  `,
  styles: [`
    .scroll-to-top-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: rgba(0, 52, 102, 0.75);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9990;
      opacity: 0;
      visibility: hidden;
      transform: translateY(12px);
      transition: opacity 0.35s ease, visibility 0.35s ease, transform 0.35s ease, background 0.2s ease;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .scroll-to-top-btn.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .scroll-to-top-btn:hover {
      background: rgba(0, 74, 143, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 52, 102, 0.3);
    }

    .scroll-to-top-btn:active {
      transform: translateY(0);
      background: rgba(0, 34, 68, 0.9);
    }

    @media (max-width: 600px) {
      .scroll-to-top-btn {
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
      }
    }
  `]
})
export class ScrollToTopComponent {
  isVisible = false;

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    this.isVisible = scrollPercent >= 50;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
