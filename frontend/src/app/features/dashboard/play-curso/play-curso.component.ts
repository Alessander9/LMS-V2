import { Component, OnInit, OnDestroy, AfterViewInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlumnoDashboardService, AlumnoPlayCourse, AlumnoPlayModulo, AlumnoPlayVideo } from '../../../core/services/';
import { CertificadoService } from '../../../core/services/';
import { AuthService } from '../../../core/services/';
import { ArchivoProtegidoService } from '../../../core/services/';
import { VideoService } from '../../../core/services/';
import { TareaService } from '../../../core/services/';
import { EntregaTareaService } from '../../../core/services/';
import { ToastService } from '../../../core/services/';
import { UserProfile } from '../../../core/models/';
import { AlumnoTareaItem } from '../../../core/models/';
import { extraerIdYoutube } from '../../../core/utils/';
import { formatBytes, getCleanFileType, getFileExtension } from '../../../core/utils/';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-play-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './play-curso.component.html',
  styleUrls: ['./play-curso.component.css']
})
export class PlayCursoComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private authService = inject(AuthService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private videoService = inject(VideoService);
  private tareaService = inject(TareaService);
  private entregaTareaService = inject(EntregaTareaService);
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);

  profile: UserProfile | null = null;
  cursoId!: number;
  curso: AlumnoPlayCourse | null = null;
  currentVideo: AlumnoPlayVideo | null = null;
  embedError = false;

  isLoading = true;
  isPlayerLoading = false;
  activeTab: 'materiales' | 'tareas' | 'info' | 'certificado' | '' = 'materiales';
  selectedBlockedModulo: AlumnoPlayModulo | null = null;
  
  // Tareas properties
  tareas: AlumnoTareaItem[] = [];
  loadingTareas = false;
  uploadingTareaId: number | null = null;
  uploadProgress = 0;
  selectedFiles: { [tareaId: number]: File } = {};
  comentariosEntrega: { [tareaId: number]: string } = {};
  selectedFileNames: { [tareaId: number]: string } = {};
  isSavingProgress = false;
  courseCompleted = false;
  showCompletionModal = false;
  completionModalSecondsLeft = 0;
  showNextChapterCountdown = false;
  nextChapterSecondsLeft = 5;
  nextChapterLabel = '';
  certificatePdfUrl: string | null = null;
  certificateCode: string | null = null;
  totalVideos = 0;
  completedVideos = 0;
  completionPercentage = 0;

  // Touch & Hover Video Controls Overlay
  showControlsOverlay = false;
  seekFeedback: string | null = null;
  seekFeedbackSide: 'left' | 'right' | null = null;
  public isVideoPlaying = false;
  private controlsTimeout: ReturnType<typeof setTimeout> | null = null;
  private seekFeedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Ticker tracking
  private tickerInterval: ReturnType<typeof setInterval> | null = null;
  private secondsWatched = 0;
  private pendingAutoCompleteVideoId: number | null = null;

  // YouTube Player instance
  private player: any = null;
  private isPlayerReady = false;

  private isViewInitialized = false;
  private pendingVideoToPlay: AlumnoPlayVideo | null = null;
  private completionModalShown = false;
  private pendingNextVideo: AlumnoPlayVideo | null = null;

  // Robustness: cleanup subject for subscriptions
  private destroy$ = new Subject<void>();
  // Robustness: retry timeout reference for cancellation
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  // Robustness: track script load retries
  private scriptLoadRetries = 0;
  private readonly MAX_SCRIPT_RETRIES = 3;
  // Robustness: track if component is alive
  private isComponentAlive = true;
  // Robustness: track unsaved progress
  private hasUnsavedProgress = false;
  private durationPersistedForVideoId: number | null = null;
  // Completion modal timers
  private completionModalTimeout: ReturnType<typeof setTimeout> | null = null;
  private completionCountdownInterval: ReturnType<typeof setInterval> | null = null;
  private nextChapterCountdownInterval: ReturnType<typeof setInterval> | null = null;
  private nextChapterTimeout: ReturnType<typeof setTimeout> | null = null;

  private pendingVideoIdFromQuery: number | null = null;

  ngOnInit(): void {
    this.isExpUser = this.authService.isExpUser();

    this.authService.getProfile().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => { 
        this.profile = user; 
        if (user?.isExpUser) {
          this.isExpUser = true;
        }
      }
    });

    // Read query params for specific videoId
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      const videoIdParam = queryParams.get('videoId');
      this.pendingVideoIdFromQuery = videoIdParam ? Number(videoIdParam) : null;
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/dashboard/mis-cursos']);
        return;
      }
      this.cursoId = Number(idParam);
      this.loadCoursePlaySession();
    });
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.pendingVideoToPlay) {
      this.playVideo(this.pendingVideoToPlay);
      this.pendingVideoToPlay = null;
    }
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;

    // Cancel all subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Cancel pending retry timeouts
    this.cancelRetryTimeout();
    this.clearCompletionModalTimers();
    this.clearNextChapterTimers();
    this.clearControlsTimeout();
    this.clearSeekFeedbackTimeout();

    // Stop ticker
    this.stopTicker();

    // Save any unsaved progress before destroying
    this.saveProgressOnExit();

    // Destroy YouTube player
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {}
      this.player = null;
      this.isPlayerReady = false;
    }
  }

  /** Save progress when user closes tab or navigates away */
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.saveProgressOnExit();
  }

  /** Attempt to persist current progress using sendBeacon (non-blocking) */
  private saveProgressOnExit(): void {
    if (!this.hasUnsavedProgress || !this.currentVideo || this.currentVideo.completado) return;

    const duration = this.getCurrentVideoDurationSeconds();
    const secondsToSend = Math.min(duration, Math.max(0, Math.ceil(this.secondsWatched)));

    // Use sendBeacon for reliable delivery even during page unload
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.stringify({
        videoId: this.currentVideo.id,
        ultimoSegundo: secondsToSend,
        duracionSegundos: duration
      });
      const headers = { type: 'application/json' };
      const blob = new Blob([payload], headers);

      // sendBeacon doesn't support custom headers, so we fall back to sync XHR for auth
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${environment.apiUrl}/avance`, false); // synchronous
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.send(payload);
    } catch (e) {
      // Best effort — if it fails, progress was already saved periodically
    }

    this.hasUnsavedProgress = false;
  }

  private flattenVideos(): AlumnoPlayVideo[] {
    if (!this.curso) return [];
    return this.curso.modulos.filter(mod => !mod.bloqueado).flatMap(mod => mod.videos);
  }

  private getNextVideoAfter(videoId: number): AlumnoPlayVideo | null {
    const videos = this.flattenVideos();
    const currentIndex = videos.findIndex(v => v.id === videoId);
    if (currentIndex === -1 || currentIndex + 1 >= videos.length) return null;
    return videos[currentIndex + 1];
  }

  private getPreviousVideoBefore(videoId: number): AlumnoPlayVideo | null {
    const videos = this.flattenVideos();
    const currentIndex = videos.findIndex(v => v.id === videoId);
    if (currentIndex <= 0) return null;
    return videos[currentIndex - 1];
  }

  private syncVideoCompletionState(videoId: number, progress: Partial<AlumnoPlayVideo>): void {
    if (!this.curso) return;

    for (const modulo of this.curso.modulos) {
      for (const video of modulo.videos) {
        if (video.id !== videoId) continue;
        if (progress.ultimoSegundo !== undefined) video.ultimoSegundo = progress.ultimoSegundo;
        if (progress.porcentajeVisto !== undefined) video.porcentajeVisto = progress.porcentajeVisto;
        if (progress.completado !== undefined) video.completado = progress.completado;
      }
    }
  }

  private guardarDuracionReal(): void {
    if (!this.currentVideo || !this.player) return;
    if (this.durationPersistedForVideoId === this.currentVideo.id) return;
    try {
      const ytDuration = this.player.getDuration();
      if (ytDuration && ytDuration > 0) {
        this.durationPersistedForVideoId = this.currentVideo.id;
        this.currentVideo.duracionSegundos = ytDuration;
        this.videoService.actualizarDuracion(this.currentVideo.id, ytDuration).subscribe({
          error: () => {}
        });
      }
    } catch (_e) {}
  }

  private forceCompleteCurrentVideo(): void {
    if (!this.currentVideo || this.currentVideo.completado) return;

    this.pendingAutoCompleteVideoId = this.currentVideo.id;
    this.secondsWatched = this.getCurrentVideoDurationSeconds();
    this.currentVideo.ultimoSegundo = this.secondsWatched;
    this.currentVideo.porcentajeVisto = 100;
    this.currentVideo.completado = true;
    this.syncVideoCompletionState(this.currentVideo.id, {
      ultimoSegundo: this.secondsWatched,
      porcentajeVisto: 100,
      completado: true
    });
    this.checkOverallCompletion(true);
  }

  loadCoursePlaySession(): void {
    this.studentService.getPlayCourse(this.cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        if (data && data.modulos) {
          data.modulos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
          data.modulos.forEach(mod => {
            if (mod.videos) {
              mod.videos.sort((a, b) => {
                if (a.orden !== b.orden) {
                  return (a.orden || 0) - (b.orden || 0);
                }
                return a.titulo.localeCompare(b.titulo, undefined, { numeric: true, sensitivity: 'base' });
              });
            }
          });
        }
        this.curso = data;
        this.isLoading = false;
        this.selectDefaultVideo(this.pendingVideoIdFromQuery);
        this.checkOverallCompletion(false);
        this.loadTareas();
      },
      error: () => {
        this.router.navigate(['/dashboard/mis-cursos']);
      }
    });
  }

  selectDefaultVideo(videoId?: number | null): void {
    if (!this.curso || this.curso.modulos.length === 0) return;

    const unlockedModulos = this.curso.modulos.filter(m => !m.bloqueado);
    if (unlockedModulos.length === 0) {
      this.selectedBlockedModulo = this.curso.modulos[0];
      this.currentVideo = null;
      return;
    }

    let targetVideo: AlumnoPlayVideo | null = null;

    // If a specific videoId was requested, find it in unlocked modules
    if (videoId) {
      for (const mod of unlockedModulos) {
        for (const vid of mod.videos) {
          if (vid.id === videoId) {
            targetVideo = vid;
            break;
          }
        }
        if (targetVideo) break;
      }
    }

    // Otherwise, find first uncompleted video in unlocked modules
    if (!targetVideo) {
      for (const mod of unlockedModulos) {
        for (const vid of mod.videos) {
          if (!vid.completado) { targetVideo = vid; break; }
        }
        if (targetVideo) break;
      }
    }

    // Fallback to first video in unlocked modules
    if (!targetVideo) {
      for (const mod of unlockedModulos) {
        if (mod.videos.length > 0) { targetVideo = mod.videos[0]; break; }
      }
    }

    if (targetVideo) {
      this.selectedBlockedModulo = null;
      this.playVideo(targetVideo);
    } else {
      this.selectedBlockedModulo = this.curso.modulos[0];
    }
  }

  onVideoClick(mod: AlumnoPlayModulo, vid: AlumnoPlayVideo): void {
    if (mod.bloqueado) {
      this.selectedBlockedModulo = mod;
      this.currentVideo = null;
      this.destroyPlayerSafely();
      return;
    }
    this.selectedBlockedModulo = null;
    this.playVideo(vid);
  }

  solicitarHabilitacionWhatsApp(mod?: AlumnoPlayModulo | null): void {
    const moduloNombre = mod?.nombre || 'este módulo';
    const cursoNombre = this.curso?.nombre || 'el curso';
    const alumnoNombre = this.profile ? `${this.profile.nombres} ${this.profile.apellidos}`.trim() : 'Estudiante';
    
    const mensaje = `Hola Plataforma LMS, soy ${alumnoNombre}, deseo coordinar el pago para habilitar el Módulo "${moduloNombre}" del curso "${cursoNombre}".`;
    const whatsappUrl = `https://wa.me/51939371250?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  }

  playVideo(video: AlumnoPlayVideo): void {
    // Save progress of previous video before switching
    if (this.currentVideo && this.hasUnsavedProgress && this.currentVideo.id !== video.id) {
      this.saveCurrentProgress(false);
    }

    this.stopTicker();
    this.cancelRetryTimeout();
    this.clearNextChapterTimers();
    this.isVideoPlaying = false;
    this.currentVideo = video;
    this.secondsWatched = this.getPlaybackStartSeconds(video);
    this.embedError = false;
    this.isPlayerLoading = true;
    this.hasUnsavedProgress = false;

    if (!this.isViewInitialized) {
      this.pendingVideoToPlay = video;
      return;
    }

    const id = (video.youtubeId || '').trim() || extraerIdYoutube(video.youtubeUrl);
    if (!id) {
      this.embedError = true;
      this.isPlayerLoading = false;
      return;
    }

    if (this.player && this.isPlayerReady && this.isPlayerIframeValid()) {
      try {
        this.player.loadVideoById({
          videoId: id,
          startSeconds: this.getPlaybackStartSeconds(video)
        });
        this.isPlayerLoading = false;
        this.startTicker();
      } catch (e) {
        console.warn('Player loadVideoById failed, recreating player:', e);
        this.destroyPlayerSafely();
        this.initYoutubePlayer(id, this.getPlaybackStartSeconds(video));
      }
    } else {
      this.destroyPlayerSafely();
      this.initYoutubePlayer(id, this.getPlaybackStartSeconds(video));
    }
  }

  /** Verify the player's iframe still exists in the DOM */
  private isPlayerIframeValid(): boolean {
    if (!this.player) return false;
    try {
      const iframe = this.player.getIframe?.();
      return !!(iframe && iframe.parentNode && document.body.contains(iframe));
    } catch {
      return false;
    }
  }

  /** Safely destroy the player without throwing */
  private destroyPlayerSafely(): void {
    if (this.player) {
      try { this.player.destroy(); } catch (e) {}
      this.player = null;
      this.isPlayerReady = false;
    }
  }

  private initYoutubePlayer(videoId: string, startSeconds: number): void {
    const YT = (window as any)['YT'];

    if (!YT || !YT.Player) {
      this.loadYouTubeScript(videoId, startSeconds);
    } else {
      this.createPlayer(videoId, startSeconds);
    }
  }

  /** Load the YouTube IFrame API script with error handling and retries */
  private loadYouTubeScript(videoId: string, startSeconds: number): void {
    // Check if script tag already exists (but API not ready yet)
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      // Script is loading, just wait for the callback
      this.setYouTubeReadyCallback(videoId, startSeconds);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    // Robustness: handle script load failure
    tag.onerror = () => {
      if (!this.isComponentAlive) return;

      this.scriptLoadRetries++;
      console.warn(`YouTube API script failed to load (attempt ${this.scriptLoadRetries}/${this.MAX_SCRIPT_RETRIES})`);

      // Remove the failed script tag
      tag.remove();

      if (this.scriptLoadRetries < this.MAX_SCRIPT_RETRIES) {
        // Retry with exponential backoff (500ms, 1000ms, 2000ms)
        const delay = 500 * Math.pow(2, this.scriptLoadRetries - 1);
        this.retryTimeout = setTimeout(() => {
          if (this.isComponentAlive) {
            this.loadYouTubeScript(videoId, startSeconds);
          }
        }, delay);
      } else {
        this.ngZone.run(() => {
          this.embedError = true;
          this.isPlayerLoading = false;
        });
      }
    };

    this.setYouTubeReadyCallback(videoId, startSeconds);

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }

  /** Set the global onYouTubeIframeAPIReady callback without overwriting existing ones */
  private setYouTubeReadyCallback(videoId: string, startSeconds: number): void {
    const existingCallback = (window as any)['onYouTubeIframeAPIReady'];

    (window as any)['onYouTubeIframeAPIReady'] = () => {
      // Chain previous callback if it existed from another component
      if (existingCallback && existingCallback !== (window as any)['onYouTubeIframeAPIReady']) {
        try { existingCallback(); } catch (e) {}
      }
      if (this.isComponentAlive) {
        this.createPlayer(videoId, startSeconds);
      }
    };
  }

  private createPlayer(videoId: string, startSeconds: number, retryCount = 0): void {
    if (!this.isComponentAlive) return;

    const maxRetries = 10;
    const playerEl = document.getElementById('youtube-player');

    if (!this.isViewInitialized || !playerEl) {
      if (retryCount < maxRetries) {
        // DOM not ready yet (Angular hasn't rendered *ngIf="curso"), retry shortly
        this.retryTimeout = setTimeout(() => {
          if (this.isComponentAlive) {
            this.createPlayer(videoId, startSeconds, retryCount + 1);
          }
        }, 100);
      } else {
        console.error('YouTube player container not found after retries');
        this.embedError = true;
        this.isPlayerLoading = false;
      }
      return;
    }

    // Validate that YT.Player constructor is available
    const YT = (window as any)['YT'];
    if (!YT || typeof YT.Player !== 'function') {
      console.error('YT.Player constructor not available');
      this.embedError = true;
      this.isPlayerLoading = false;
      return;
    }

    this.destroyPlayerSafely();

    try {
      this.player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          start: startSeconds,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          'onReady': () => {
            if (!this.isComponentAlive) return;
            this.ngZone.run(() => {
              this.isPlayerReady = true;
              this.isPlayerLoading = false;
              // Desactivar subtítulos por defecto
              try {
                if (this.player && this.player.setOption) {
                  this.player.setOption('captions', 'track', {});
                }
              } catch (_e) {}
              // Persistir duración real ni bien el player esté listo
              this.guardarDuracionReal();
              this.startTicker();
            });
          },
          'onStateChange': (event: any) => {
            if (!this.isComponentAlive) return;
            this.ngZone.run(() => {
              this.onPlayerStateChange(event);
            });
          },
          'onError': (event: any) => {
            if (!this.isComponentAlive) return;
            const errorCode = event?.data;
            console.warn('YouTube player error, code:', errorCode);
            this.ngZone.run(() => {
              this.embedError = true;
              this.isPlayerLoading = false;
              this.stopTicker();
            });
          }
        }
      });
    } catch (e) {
      console.error('Error creating YouTube player:', e);
      this.embedError = true;
      this.isPlayerLoading = false;
    }
  }

  private onPlayerStateChange(event: any): void {
    const state = event.data;

    // Dynamically update duration if available
    if (this.player && typeof this.player.getDuration === 'function' && this.currentVideo) {
      try {
        const ytDuration = this.player.getDuration();
        if (ytDuration > 0) {
          this.currentVideo.duracionSegundos = ytDuration;
        }
      } catch (e) {}
    }

    // YT.PlayerState.PLAYING is 1
    if (state === 1) {
      this.isVideoPlaying = true;
      this.isPlayerLoading = false;
      // Persistir duración real al empezar a reproducir
      this.guardarDuracionReal();
    } else if (state === 0) {
      // YT.PlayerState.ENDED is 0
      this.isVideoPlaying = false;
      this.stopTicker();
      if (this.currentVideo && !this.currentVideo.completado) {
        this.forceCompleteCurrentVideo();
        if (!this.isSavingProgress) {
          this.saveCurrentProgress(true);
        }
      }
    } else if (state === 3) {
      // BUFFERING — show loading
      this.isPlayerLoading = true;
      this.isVideoPlaying = false;
    } else {
      // PAUSED (2), CUED (5), UNSTARTED (-1)
      this.isVideoPlaying = false;
      this.isPlayerLoading = false;
    }
  }

  getCurrentVideoLink(): string {
    return this.currentVideo?.youtubeUrl || '#';
  }

  startTicker(): void {
    this.stopTicker();
    let secondsSinceLastSave = 0;

    this.tickerInterval = setInterval(() => {
      if (!this.isComponentAlive) { this.stopTicker(); return; }

      // Double check current duration dynamically
      if (this.player && typeof this.player.getDuration === 'function' && this.currentVideo) {
        try {
          const ytDuration = this.player.getDuration();
          if (ytDuration > 0) {
            this.currentVideo.duracionSegundos = ytDuration;
          }
        } catch (e) {}
      }

      if (!this.currentVideo || !this.isVideoPlaying) return;

      const duration = this.getCurrentVideoDurationSeconds();
      const playerSeconds = this.player && typeof this.player.getCurrentTime === 'function'
        ? Number(this.player.getCurrentTime() || 0)
        : this.secondsWatched + 1;
      this.secondsWatched = Math.min(Math.max(0, playerSeconds), duration);
      this.hasUnsavedProgress = true;
      secondsSinceLastSave++;

      // Completion fallback threshold: wait until the video is effectively finished,
      // but do not cut playback a full second early.
      const completionThreshold = Math.max(duration - 0.25, 1);
      if (this.secondsWatched >= completionThreshold) {
        if (!this.currentVideo.completado) {
          this.forceCompleteCurrentVideo();
          if (!this.isSavingProgress) {
            this.saveCurrentProgress(true);
          }
        }
        this.stopTicker();
        return;
      }

      if (secondsSinceLastSave >= 15) {
        this.saveCurrentProgress(false);
        secondsSinceLastSave = 0;
      }
    }, 1000);
  }

  stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  /** Cancel any pending retry timeout */
  private cancelRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  saveCurrentProgress(isManualComplete: boolean): void {
    if (!this.currentVideo || this.isSavingProgress) return;

    const duration = this.getCurrentVideoDurationSeconds();
    const secondsToSend = isManualComplete
      ? duration
      : Math.min(duration, Math.max(0, Math.ceil(this.secondsWatched)));

    this.isSavingProgress = true;
    this.studentService.guardarProgreso(this.currentVideo.id, secondsToSend, duration).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (progress) => {
        this.isSavingProgress = false;
        this.hasUnsavedProgress = false;
        const isAutoCompleteAttempt = this.pendingAutoCompleteVideoId === this.currentVideo?.id;
        const completedByThisSave = progress.completado && isAutoCompleteAttempt;
        const normalizedProgress = isAutoCompleteAttempt
          ? {
              ...progress,
              ultimoSegundo: duration,
              porcentajeVisto: 100,
              completado: true
            }
          : progress;

        if (this.currentVideo) {
          this.syncVideoCompletionState(this.currentVideo.id, {
            ultimoSegundo: normalizedProgress.ultimoSegundo,
            porcentajeVisto: normalizedProgress.porcentajeVisto,
            completado: normalizedProgress.completado
          });
          if (normalizedProgress.completado) {
            this.currentVideo.completado = true;
          }
        }

        this.checkOverallCompletion(normalizedProgress.completado === true);

        if (
          this.currentVideo &&
          completedByThisSave &&
          !this.courseCompleted
        ) {
          const nextVideo = this.getNextVideoAfter(this.currentVideo.id);
          if (nextVideo) {
            this.openNextChapterCountdown(nextVideo);
          }
        }

        if (this.currentVideo && isAutoCompleteAttempt && !this.currentVideo.completado) {
          this.pendingAutoCompleteVideoId = null;
          this.saveCurrentProgress(true);
          return;
        }

        if (this.currentVideo?.completado) {
          this.pendingAutoCompleteVideoId = null;
        }
      },
      error: () => { this.isSavingProgress = false; }
    });
  }

  checkOverallCompletion(showCelebration = false): void {
    if (!this.curso) return;

    let totalVids = 0;
    let completedVids = 0;

    for (const mod of this.curso.modulos) {
      for (const vid of mod.videos) {
        totalVids++;
        if (vid.completado) completedVids++;
      }
    }

    this.totalVideos = totalVids;
    this.completedVideos = completedVids;
    this.completionPercentage = totalVids > 0 ? Math.round((completedVids / totalVids) * 100) : 0;
    this.courseCompleted = totalVids > 0 && completedVids === totalVids;

    if (this.courseCompleted) {
      this.fetchOrCreateCertificate();
      if (showCelebration) {
        this.openCompletionModal();
      }
    }
  }

  private openCompletionModal(): void {
    if (this.completionModalShown || !this.courseCompleted) return;

    this.completionModalShown = true;
    this.showCompletionModal = true;
    this.clearCompletionModalTimers();
    this.completionModalSecondsLeft = 6;

    this.completionCountdownInterval = setInterval(() => {
      if (this.completionModalSecondsLeft > 0) {
        this.completionModalSecondsLeft--;
      }
    }, 1000);

    this.completionModalTimeout = setTimeout(() => {
      this.closeCompletionModal();
    }, 6000);
  }

  closeCompletionModal(): void {
    this.showCompletionModal = false;
    this.clearCompletionModalTimers();
  }

  private clearCompletionModalTimers(): void {
    if (this.completionModalTimeout) {
      clearTimeout(this.completionModalTimeout);
      this.completionModalTimeout = null;
    }
    if (this.completionCountdownInterval) {
      clearInterval(this.completionCountdownInterval);
      this.completionCountdownInterval = null;
    }
    this.completionModalSecondsLeft = 0;
  }

  private openNextChapterCountdown(nextVideo: AlumnoPlayVideo): void {
    this.clearNextChapterTimers();

    if (!this.currentVideo || this.courseCompleted) return;

    this.pendingNextVideo = nextVideo;
    this.showNextChapterCountdown = true;
    this.nextChapterSecondsLeft = 5;
    this.nextChapterLabel = nextVideo.titulo;

    this.nextChapterCountdownInterval = setInterval(() => {
      if (this.nextChapterSecondsLeft > 0) {
        this.nextChapterSecondsLeft--;
      }
    }, 1000);

    this.nextChapterTimeout = setTimeout(() => {
      const target = this.pendingNextVideo;
      this.clearNextChapterTimers();
      if (target && this.isComponentAlive) {
        this.ngZone.run(() => this.playVideo(target));
      }
    }, 5000);
  }

  closeNextChapterCountdown(): void {
    this.clearNextChapterTimers();
  }

  goToNextChapterNow(): void {
    const target = this.pendingNextVideo;
    this.clearNextChapterTimers();
    if (target && this.isComponentAlive) {
      this.ngZone.run(() => this.playVideo(target));
    }
  }

  private clearNextChapterTimers(): void {
    if (this.nextChapterTimeout) {
      clearTimeout(this.nextChapterTimeout);
      this.nextChapterTimeout = null;
    }
    if (this.nextChapterCountdownInterval) {
      clearInterval(this.nextChapterCountdownInterval);
      this.nextChapterCountdownInterval = null;
    }
    this.showNextChapterCountdown = false;
    this.nextChapterSecondsLeft = 5;
    this.nextChapterLabel = '';
    this.pendingNextVideo = null;
  }

  isExpUser = false;

  fetchOrCreateCertificate(): void {
    this.certificadoService.generarCertificado(this.cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cert) => {
        this.certificatePdfUrl = cert.archivoPdf;
        this.certificateCode = cert.codigo;
      },
      error: (err) => console.error('Error al generar certificado:', err)
    });
  }

  descargarMaterial(url: string, nombre: string, tipoArchivo: string): void {
    if (this.isExpUser) {
      this.toastService.warning('Las descargas de materiales no están permitidas en el modo EXP Plataforma LMS.');
      return;
    }
    const extension = getFileExtension(tipoArchivo);
    const fileName = nombre.toLowerCase().endsWith(`.${extension}`) ? nombre : `${nombre}.${extension}`;
    this.archivoProtegidoService.descargar(url, fileName).subscribe({
      error: (err) => console.error('Error al descargar material:', err)
    });
  }

  descargarCertificado(): void {
    if (this.isExpUser) {
      this.toastService.warning('La emisión de certificados está reservada para alumnos con matrícula oficial.');
      return;
    }
    if (!this.certificatePdfUrl || !this.certificateCode) return;
    this.archivoProtegidoService.descargar(
      this.certificatePdfUrl,
      `certificado-${this.certificateCode}.pdf`
    ).subscribe({
      error: (err) => console.error('Error al descargar certificado:', err)
    });
  }

  formatBytes = formatBytes;
  getCleanFileType = getCleanFileType;

  toggleFullscreen(element: HTMLDivElement): void {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => console.error(err.message));
    } else {
      document.exitFullscreen();
    }
  }

  loadTareas(): void {
    if (!this.cursoId) return;
    this.loadingTareas = true;
    this.tareaService.listarTareasPorCursoParaAlumno(this.cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.tareas = data || [];
        this.loadingTareas = false;
      },
      error: (err) => {
        console.error('Error al cargar tareas del curso:', err);
        this.loadingTareas = false;
      }
    });
  }

  getTareasPorModulo(moduloId: number): AlumnoTareaItem[] {
    return this.tareas.filter(t => t.moduloId === moduloId);
  }

  onFileSelected(tareaId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 100 * 1024 * 1024) {
        this.toastService.error('El archivo no puede superar los 100MB');
        input.value = '';
        return;
      }
      this.selectedFiles[tareaId] = file;
      this.selectedFileNames[tareaId] = file.name;
    }
  }

  subirEntrega(tareaId: number): void {
    const file = this.selectedFiles[tareaId];
    if (!file) {
      this.toastService.warning('Debes seleccionar un archivo para entregar');
      return;
    }

    const comentario = this.comentariosEntrega[tareaId] || '';
    this.uploadingTareaId = tareaId;
    this.uploadProgress = 0;

    this.entregaTareaService.entregarTareaConProgreso(tareaId, file, comentario).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadingTareaId = null;
          this.uploadProgress = 0;
          delete this.selectedFiles[tareaId];
          delete this.selectedFileNames[tareaId];
          delete this.comentariosEntrega[tareaId];
          this.toastService.success('¡Tarea entregada exitosamente!');
          this.loadTareas();
        }
      },
      error: (err) => {
        this.uploadingTareaId = null;
        this.uploadProgress = 0;
        const msg = err?.error?.message || 'Error al subir la entrega de la tarea';
        this.toastService.error(msg);
      }
    });
  }

  descargarArchivoEntrega(entregaId?: number, nombreTarea?: string, tipoArchivo?: string): void {
    if (!entregaId) return;
    const url = `${environment.apiUrl}/entregas-tareas/${entregaId}/download`;
    const extension = getFileExtension(tipoArchivo || '');
    const filename = `Mi_Entrega_${(nombreTarea || 'Tarea').replace(/\s+/g, '_')}.${extension}`;
    this.archivoProtegidoService.descargar(url, filename).subscribe({
      error: (err) => {
        console.error('Error al descargar archivo de entrega:', err);
        this.toastService.error('No se pudo descargar el archivo de la entrega');
      }
    });
  }

  // --- Touch & Hover Video Controls Overlay Methods ---
  triggerShowControls(keepOpen = false): void {
    this.showControlsOverlay = true;
    this.clearControlsTimeout();
    if (!keepOpen && this.isVideoPlaying) {
      this.controlsTimeout = setTimeout(() => {
        if (this.isComponentAlive && this.isVideoPlaying) {
          this.showControlsOverlay = false;
        }
      }, 2800);
    }
  }

  hideControls(): void {
    this.clearControlsTimeout();
    if (this.isVideoPlaying) {
      this.showControlsOverlay = false;
    }
  }

  private clearControlsTimeout(): void {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }
  }

  private clearSeekFeedbackTimeout(): void {
    if (this.seekFeedbackTimeout) {
      clearTimeout(this.seekFeedbackTimeout);
      this.seekFeedbackTimeout = null;
    }
    this.seekFeedback = null;
    this.seekFeedbackSide = null;
  }

  seekRelative(seconds: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.player || typeof this.player.getCurrentTime !== 'function') return;

    try {
      const current = this.player.getCurrentTime() || 0;
      const duration = this.getCurrentVideoDurationSeconds();
      const target = Math.max(0, Math.min(duration, current + seconds));
      this.player.seekTo(target, true);

      // Feedback animation
      this.clearSeekFeedbackTimeout();
      this.seekFeedback = seconds > 0 ? `+${seconds}s` : `${seconds}s`;
      this.seekFeedbackSide = seconds > 0 ? 'right' : 'left';

      this.seekFeedbackTimeout = setTimeout(() => {
        this.seekFeedback = null;
        this.seekFeedbackSide = null;
      }, 650);

      this.triggerShowControls();
    } catch (e) {
      console.warn('Error seeking player:', e);
    }
  }

  togglePlayPause(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.player) return;

    try {
      if (this.isVideoPlaying) {
        if (typeof this.player.pauseVideo === 'function') {
          this.player.pauseVideo();
        }
        this.isVideoPlaying = false;
        this.triggerShowControls(true);
      } else {
        if (typeof this.player.playVideo === 'function') {
          this.player.playVideo();
        }
        this.isVideoPlaying = true;
        this.triggerShowControls(false);
      }
    } catch (e) {
      console.warn('Error toggling play/pause:', e);
    }
  }

  hasPreviousVideo(): boolean {
    if (!this.currentVideo) return false;
    return this.getPreviousVideoBefore(this.currentVideo.id) !== null;
  }

  hasNextVideo(): boolean {
    if (!this.currentVideo) return false;
    return this.getNextVideoAfter(this.currentVideo.id) !== null;
  }

  goToPreviousVideo(): void {
    if (!this.currentVideo) return;
    const prev = this.getPreviousVideoBefore(this.currentVideo.id);
    if (prev) {
      this.playVideo(prev);
    }
  }

  goToNextVideo(): void {
    if (!this.currentVideo) return;
    const next = this.getNextVideoAfter(this.currentVideo.id);
    if (next) {
      this.playVideo(next);
    }
  }

  private getCurrentVideoDurationSeconds(): number {
    return Math.max(1, this.currentVideo?.duracionSegundos || 600);
  }

  private getPlaybackStartSeconds(video: AlumnoPlayVideo): number {
    if (video.completado) {
      return 0;
    }

    const duration = Math.max(1, video.duracionSegundos || 0);
    const watched = Math.max(0, video.ultimoSegundo || 0);
    return Math.min(watched, duration - 1);
  }
}


