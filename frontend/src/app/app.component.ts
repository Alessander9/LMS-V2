import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocialSidebarComponent } from './core/components/social-sidebar/social-sidebar.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ScrollToTopComponent } from './core/components/scroll-to-top/scroll-to-top.component';
import { ChatbotWidgetComponent } from './core/components/chatbot-widget/chatbot-widget.component';
import { ThemeService, SeoService } from './core/services/';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SocialSidebarComponent, ToastComponent, ScrollToTopComponent, ChatbotWidgetComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Plataforma LMS - Aula Virtual';
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);
}
