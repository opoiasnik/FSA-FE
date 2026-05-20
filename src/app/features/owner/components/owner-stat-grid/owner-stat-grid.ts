import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface OwnerStatCard {
  label: string;
  value: string;
  delta: string;
  tone: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-owner-stat-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-stat-grid.html',
  styleUrls: ['./owner-stat-grid.scss']
})
export class OwnerStatGrid {
  @Input({ required: true }) cards: OwnerStatCard[] = [];
}
