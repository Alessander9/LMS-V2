import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="visible"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      class="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      (click)="cancel()">
      
      <!-- Modal Content Card -->
      <div 
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl dark:shadow-black/30 animate-scale-up relative"
        (click)="$event.stopPropagation()">
        
        <!-- Header Decorator depending on type -->
        <div class="h-2 w-full" [ngClass]="getBarClass()"></div>

        <!-- Body -->
        <div class="p-6 flex flex-col items-center text-center">
          
          <!-- Icon container -->
          <div 
            [ngClass]="getIconBgClass()"
            class="w-14 h-14 rounded-full flex items-center justify-center mb-4 shrink-0 shadow-inner">
            <span class="material-symbols-outlined text-2xl select-none" [ngClass]="getIconTextClass()">
              {{ getIconName() }}
            </span>
          </div>

          <!-- Title -->
          <h3 id="confirm-modal-title" class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-2">{{ title }}</h3>
          
          <!-- Message -->
          <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-6">{{ message }}</p>

          <!-- Buttons Actions -->
          <div class="flex gap-3 w-full">
            <button 
              (click)="cancel()" 
              class="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors rounded-xl select-none">
              {{ cancelText }}
            </button>
            <button 
              (click)="confirm()" 
              [ngClass]="getConfirmButtonClass()"
              class="flex-1 py-3 px-4 text-white text-xs font-black uppercase tracking-widest transition-colors rounded-xl select-none shadow-md">
              {{ confirmText }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() type: 'success' | 'danger' | 'info' | 'warning' = 'info';
  @Input() title = 'Confirmar Acción';
  @Input() message = '¿Estás seguro de que deseas continuar?';
  @Input() confirmText = 'Aceptar';
  @Input() cancelText = 'Cancelar';

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }

  getBarClass(): string {
    switch (this.type) {
      case 'success': return 'bg-emerald-500';
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'info':
      default: return 'bg-blue-500';
    }
  }

  getIconBgClass(): string {
    switch (this.type) {
      case 'success': return 'bg-emerald-50 dark:bg-emerald-950/40';
      case 'danger': return 'bg-red-50 dark:bg-red-950/40';
      case 'warning': return 'bg-amber-50 dark:bg-amber-950/40';
      case 'info':
      default: return 'bg-blue-50 dark:bg-blue-950/40';
    }
  }

  getIconTextClass(): string {
    switch (this.type) {
      case 'success': return 'text-emerald-600';
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'info':
      default: return 'text-blue-600';
    }
  }

  getIconName(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'danger': return 'warning';
      case 'warning': return 'error_outline';
      case 'info':
      default: return 'info';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.type) {
      case 'success': return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      case 'danger': return 'bg-red-600 hover:bg-red-700 shadow-red-200';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
      case 'info':
      default: return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
    }
  }
}
