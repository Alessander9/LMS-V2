import { Component } from '@angular/core';
import { CardNavComponent } from '../card-nav/card-nav.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CardNavComponent],
  template: `<app-card-nav></app-card-nav>`,
  styleUrls: []
})
export class NavbarComponent {}
