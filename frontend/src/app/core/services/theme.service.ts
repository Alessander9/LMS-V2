import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'Plataforma LMS-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const shouldBeDark = savedTheme === 'dark';
    this.isDarkMode.set(shouldBeDark);
    this.applyTheme(shouldBeDark);
  }

  toggleTheme(): void {
    const nextDarkState = !this.isDarkMode();
    this.isDarkMode.set(nextDarkState);
    localStorage.setItem(this.THEME_KEY, nextDarkState ? 'dark' : 'light');
    this.applyTheme(nextDarkState);
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
