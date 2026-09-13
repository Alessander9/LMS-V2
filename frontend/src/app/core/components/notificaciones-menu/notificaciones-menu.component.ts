import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificacionService } from '../../services/notificacion.service';
import { NotificacionItem, NotificacionResumen } from '../../models/notificacion.model';

@Component({
  selector: 'app-notificaciones-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notificaciones-menu.component.html',
  styleUrls: ['./notificaciones-menu.component.css']
})
export class NotificacionesMenuComponent implements OnInit, OnDestroy {
  isOpen = false;
  totalNoLeidas = 0;
  notificaciones: NotificacionItem[] = [];
  cargando = false;

  private sub?: Subscription;

  constructor(
    private notificacionService: NotificacionService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.sub = this.notificacionService.resumen$.subscribe(resumen => {
      this.totalNoLeidas = resumen.totalNoLeidas;
      this.notificaciones = resumen.notificaciones;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.recargar();
    }
  }

  recargar(): void {
    this.cargando = true;
    this.notificacionService.cargarNotificaciones().subscribe({
      next: () => this.cargando = false,
      error: () => this.cargando = false
    });
  }

  marcarTodasComoLeidas(): void {
    if (this.totalNoLeidas === 0) return;
    this.notificacionService.marcarTodasComoLeidas().subscribe();
  }

  seleccionarNotificacion(notif: NotificacionItem): void {
    if (!notif.leido) {
      this.notificacionService.marcarComoLeida(notif.id).subscribe();
    }
    this.isOpen = false;

    if (notif.urlDestino && notif.urlDestino.trim() !== '') {
      if (notif.urlDestino.startsWith('http://') || notif.urlDestino.startsWith('https://')) {
        window.open(notif.urlDestino, '_blank');
      } else {
        this.router.navigateByUrl(notif.urlDestino);
      }
    }
  }

  getIconClass(tipo: string): { icon: string; bgClass: string; textClass: string } {
    switch (tipo) {
      case 'VIDEO_NUEVO':
        return { icon: 'smart_display', bgClass: 'bg-red-500/10 text-red-500', textClass: 'text-red-500' };
      case 'MATERIAL_NUEVO':
        return { icon: 'description', bgClass: 'bg-blue-500/10 text-blue-500', textClass: 'text-blue-500' };
      case 'TAREA_NUEVA':
        return { icon: 'assignment', bgClass: 'bg-amber-500/10 text-amber-500', textClass: 'text-amber-500' };
      case 'TAREA_CALIFICADA':
        return { icon: 'verified', bgClass: 'bg-emerald-500/10 text-emerald-500', textClass: 'text-emerald-500' };
      case 'TAREA_POR_VENCER':
        return { icon: 'schedule', bgClass: 'bg-orange-500/10 text-orange-500', textClass: 'text-orange-500' };
      case 'MATRICULA_NUEVA':
        return { icon: 'school', bgClass: 'bg-purple-500/10 text-purple-500', textClass: 'text-purple-500' };
      case 'ENTREGA_DOCENTE':
        return { icon: 'upload_file', bgClass: 'bg-indigo-500/10 text-indigo-500', textClass: 'text-indigo-500' };
      case 'COMUNICADO_GLOBAL':
      default:
        return { icon: 'campaign', bgClass: 'bg-primary/10 text-primary', textClass: 'text-primary' };
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
