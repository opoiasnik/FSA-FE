import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ViewingRequestResponse } from '../../services/viewing.service';

@Component({
  selector: 'app-viewing-request-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './viewing-request-card.html',
  styleUrls: ['./viewing-request-card.scss']
})
export class ViewingRequestCard {
  @Input({ required: true }) request!: ViewingRequestResponse;
  @Input() ownerMode = false;

  @Output() opened = new EventEmitter<number>();
  @Output() approved = new EventEmitter<number>();
  @Output() rejected = new EventEmitter<number>();
  @Output() cancelled = new EventEmitter<number>();

  open(): void {
    this.opened.emit(this.request.listing.id);
  }

  approve(): void {
    this.approved.emit(this.request.id);
  }

  reject(): void {
    this.rejected.emit(this.request.id);
  }

  cancel(): void {
    this.cancelled.emit(this.request.id);
  }
}
