import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) prompt!: string;
  @Input({ required: true }) linkText!: string;
  @Input({ required: true }) linkTo!: string;
  @Input() artImage = 'hero.jpg';
  @Input() artImageSize = 'cover';

  get artStyle(): Record<string, string> {
    return {
      '--auth-art-image': `url('/${this.artImage}')`,
      '--auth-art-size': this.artImageSize,
    };
  }
}
