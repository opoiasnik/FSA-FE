import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss'
})
export class HeroSection {
  @Input() image = 'hero.jpg';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() alt = '';
}
