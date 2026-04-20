import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FooterColumn {
  title: string;
  links: string[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.scss'
})
export class AppFooter {
  readonly year = new Date().getFullYear();

  readonly columns: FooterColumn[] = [
    {
      title: 'Support',
      links: ['Help center', 'How to inquire', 'Safety & trust', 'Report a listing']
    },
    {
      title: 'Company',
      links: ['About RentArea', 'Advertising', 'GDPR', 'Contact']
    },
    {
      title: 'For owners',
      links: ['List your property', 'Owner studio', 'Pricing plans', 'Posting rules']
    }
  ];

  readonly social = [
    { icon: 'pi pi-facebook', label: 'Facebook' },
    { icon: 'pi pi-instagram', label: 'Instagram' },
    { icon: 'pi pi-twitter', label: 'Twitter' }
  ];
}
