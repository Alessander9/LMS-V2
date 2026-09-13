import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toast$ = new Subject<ToastMessage>();
  private counter = 0;

  getNotifications() {
    return this.toast$.asObservable();
  }

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration = 4000) {
    this.toast$.next({
      id: this.counter++,
      type,
      title,
      message,
      duration
    });
  }

  success(message: string, title = 'Operación Exitosa') {
    this.show('success', title, message);
  }

  error(message: string, title = 'Error') {
    this.show('error', title, message);
  }

  warning(message: string, title = 'Advertencia') {
    this.show('warning', title, message);
  }

  info(message: string, title = 'Información') {
    this.show('info', title, message);
  }
}
