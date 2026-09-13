import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast.service';

interface ActiveToast extends ToastMessage {
  visible: boolean;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <div 
        *ngFor="let toast of toasts" 
        [ngClass]="[getToastClass(toast.type), toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0']"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out relative overflow-hidden">
        
        <!-- Animated Progress Loading Bar -->
        <div 
          [ngClass]="getProgressBarClass(toast.type)"
          class="absolute bottom-0 left-0 h-1 shrink-0 animate-progress-bar"
          [style.animation-duration.ms]="toast.duration || 4000">
        </div>

        <!-- Material Icon -->
        <span class="material-symbols-outlined shrink-0 text-xl" [ngClass]="getIconClass(toast.type)">
          {{ getIconName(toast.type) }}
        </span>

        <!-- Toast Body -->
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 leading-none mb-1">{{ toast.title }}</h4>
          <p class="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button 
          (click)="removeToast(toast.id)" 
          class="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
    .animate-progress-bar {
      animation: shrink linear forwards;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private sub!: Subscription;

  toasts: ActiveToast[] = [];

  ngOnInit(): void {
    this.sub = this.toastService.getNotifications().subscribe(toast => {
      const activeToast: ActiveToast = { ...toast, visible: true };
      this.toasts.push(activeToast);

      // Trigger auto close
      const duration = toast.duration || 4000;
      setTimeout(() => {
        this.animateClose(toast.id);
      }, duration);
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  removeToast(id: number): void {
    this.animateClose(id);
  }

  private animateClose(id: number): void {
    const idx = this.toasts.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.toasts[idx].visible = false;
      // Wait for slide out animation
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id);
      }, 300);
    }
  }

  getToastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-white/90 dark:bg-slate-900/90 border-emerald-200 dark:border-emerald-900/60 shadow-emerald-100/50 dark:shadow-black/20';
      case 'error':
        return 'bg-white/90 dark:bg-slate-900/90 border-red-200 dark:border-red-900/60 shadow-red-100/50 dark:shadow-black/20';
      case 'warning':
        return 'bg-white/90 dark:bg-slate-900/90 border-amber-200 dark:border-amber-900/60 shadow-amber-100/50 dark:shadow-black/20';
      case 'info':
      default:
        return 'bg-white/90 dark:bg-slate-900/90 border-blue-200 dark:border-blue-900/60 shadow-blue-100/50 dark:shadow-black/20';
    }
  }

  getProgressBarClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
      default:
        return 'text-blue-500';
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  }
}
