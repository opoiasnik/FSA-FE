import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewingRequestResponse } from '../../../viewings/services/viewing.service';

@Component({
  selector: 'app-owner-viewing-requests',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './owner-viewing-requests.html',
  styleUrls: ['./owner-viewing-requests.scss']
})
export class OwnerViewingRequests {
  @Input() requests: ViewingRequestResponse[] = [];
  @Output() approved = new EventEmitter<number>();
  @Output() rejected = new EventEmitter<number>();
}
