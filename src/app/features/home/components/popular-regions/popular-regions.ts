import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Region {
  code: string;
  name: string;
}

@Component({
  selector: 'app-popular-regions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popular-regions.html',
  styleUrl: './popular-regions.scss'
})
export class PopularRegions {
  readonly title = 'Popular regions in Slovakia';

  readonly regions: Region[] = [
    { code: 'BA', name: 'Bratislava' },
    { code: 'KE', name: 'Košice' },
    { code: 'PO', name: 'Prešov' },
    { code: 'ZA', name: 'Žilina' },
    { code: 'NR', name: 'Nitra' },
    { code: 'TT', name: 'Trnava' }
  ];

  readonly loop: Region[] = [...this.regions, ...this.regions, ...this.regions, ...this.regions];
}
