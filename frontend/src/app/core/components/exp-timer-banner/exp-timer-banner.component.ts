import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-exp-timer-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exp-timer-banner.component.html',
  styleUrls: ['./exp-timer-banner.component.css']
})
export class ExpTimerBannerComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private sub?: Subscription;

  remainingSeconds: number = 1200;
  totalDurationSeconds: number = 1200;
  progressPercentage: number = 100;
  formattedTime: string = '20:00';
  isUrgent: boolean = false;
  isCritical: boolean = false;

  readonly whatsappUrl = 'https://wa.me/51939371250?text=Hola%2C+vengo+de+probar+la+experiencia+EXP+Plataforma LMS+y+deseo+matricularme+en+un+curso';

  ngOnInit(): void {
    this.sub = this.authService.expRemainingSeconds$.subscribe(seconds => {
      this.remainingSeconds = seconds;
      this.formattedTime = this.formatSeconds(seconds);
      this.progressPercentage = Math.min(100, Math.max(0, (seconds / this.totalDurationSeconds) * 100));
      this.isUrgent = seconds <= 300 && seconds > 60; // < 5 mins
      this.isCritical = seconds <= 60; // < 1 min
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private formatSeconds(totalSecs: number): string {
    if (totalSecs <= 0) return '00:00';
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
