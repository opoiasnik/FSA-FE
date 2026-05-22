import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Avatar } from '../../../../shared/component/avatar/avatar';
import { ListingType } from '../../models/listing.model';
import { ViewingRequestResponse } from '../../../viewings/services/viewing.service';

export interface ListingSidebarOwner {
  name: string;
  role: string;
  avatarHue: number;
  verified: boolean;
}

@Component({
  selector: 'app-listing-detail-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, Avatar],
  templateUrl: './listing-detail-sidebar.html',
  styleUrls: ['./listing-detail-sidebar.scss']
})
export class ListingDetailSidebar {
  @Input({ required: true }) listingId!: number;
  @Input({ required: true }) listingType!: ListingType;
  @Input({ required: true }) owner!: ListingSidebarOwner;
  @Input() priceAmount = '';
  @Input() pricePerSqm = '';
  @Input() views = 0;
  @Input() canViewStats = false;
  @Input() ownListing = false;
  @Input() canMessageOwner = false;
  @Input() openingConversation = false;
  @Input() canBookViewing = false;
  @Input() loadingViewingRequest = false;
  @Input() currentViewingRequest: ViewingRequestResponse | null = null;
  @Input() viewingSuccess = false;

  @Output() messagesOpened = new EventEmitter<void>();
  @Output() viewingOpened = new EventEmitter<void>();
}
