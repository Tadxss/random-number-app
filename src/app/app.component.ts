import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RandomNumberDashboardComponent } from './components/random-number-dashboard/random-number-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    RandomNumberDashboardComponent
  ],
  template: `<app-random-number-dashboard></app-random-number-dashboard>`,
  styles: [],
})
export class AppComponent {
  title = 'random-number-app';
}
