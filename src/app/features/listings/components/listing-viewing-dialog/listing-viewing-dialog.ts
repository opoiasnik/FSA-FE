import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePicker } from '../../../../shared/component/date-picker/date-picker';
import { Modal } from '../../../../shared/component/modal/modal';

@Component({
  selector: 'app-listing-viewing-dialog',
  standalone: true,
  imports: [CommonModule, DatePicker, Modal],
  templateUrl: './listing-viewing-dialog.html',
  styleUrls: ['./listing-viewing-dialog.scss']
})
export class ListingViewingDialog {
  @Input() visible = false;
  @Input() date: Date | null = null;
  @Input() note = '';
  @Input() minDate = new Date();
  @Input() error: string | null = null;
  @Input() submitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() dateChange = new EventEmitter<Date | null>();
  @Output() noteChange = new EventEmitter<string>();
  @Output() submitted = new EventEmitter<void>();
}
