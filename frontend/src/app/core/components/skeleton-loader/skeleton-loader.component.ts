import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse" [class]="containerClass">
      <!-- Text line skeletons -->
      <div *ngIf="type === 'text'" class="space-y-2">
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none" [style.width.%]="100"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none" [style.width.%]="85"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none" [style.width.%]="60"></div>
      </div>

      <!-- Card skeleton -->
      <div *ngIf="type === 'card'" class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="space-y-3 flex-1">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
            <div class="h-7 bg-slate-200 dark:bg-slate-700 rounded-none w-1/4"></div>
            <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-1/2"></div>
          </div>
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0 ml-4"></div>
        </div>
      </div>

      <!-- Table row skeleton -->
      <div *ngIf="type === 'table-row'" class="flex items-center gap-3 p-3 border-b border-slate-100 dark:border-slate-800">
        <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
          <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-none w-1/2"></div>
        </div>
        <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-16 shrink-0"></div>
      </div>

      <!-- Metric card skeleton -->
      <div *ngIf="type === 'metric'" class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="space-y-2 flex-1">
            <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-2/5"></div>
            <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded-none w-1/5"></div>
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
          </div>
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
        </div>
      </div>

      <!-- Welcome banner skeleton -->
      <div *ngIf="type === 'banner'" class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 shadow-sm">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-1/5"></div>
            <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded-none w-2/5"></div>
            <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
          </div>
          <div class="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
        </div>
      </div>

      <!-- Action card skeleton (grid items) -->
      <div *ngIf="type === 'action-card'" class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-sm">
        <div class="flex items-center gap-2 sm:gap-3.5">
          <div class="w-9 h-9 sm:w-10 sm:h-10 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
          <div class="space-y-1.5 flex-1">
            <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Chart/Widget skeleton -->
      <div *ngIf="type === 'widget'" class="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-16"></div>
        </div>
        <div class="space-y-3">
          <div *ngFor="let _ of [].constructor(rows || 3)" class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-1">
              <div class="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-none shrink-0"></div>
              <div class="flex-1 space-y-1">
                <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-2/3"></div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-none w-1/3"></div>
              </div>
            </div>
            <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-none w-12"></div>
          </div>
        </div>
      </div>

      <!-- Custom fallback (simple spinner-like pulse) -->
      <div *ngIf="type === 'custom'" class="flex flex-col items-center justify-center p-12 sm:p-20 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div class="space-y-3 w-full max-w-md">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-none w-1/2 mx-auto"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-3/4 mx-auto"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-none w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'card' | 'table-row' | 'metric' | 'banner' | 'action-card' | 'widget' | 'custom' = 'text';
  @Input() rows: number = 3;
  @Input() containerClass: string = '';
}
