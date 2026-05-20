import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface VerificationStep {
  label: string;
  status: 'verified' | 'pending' | 'unverified';
}

@Component({
  selector: 'app-profile-verification-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-verification-panel.html',
  styleUrls: ['./profile-verification-panel.scss']
})
export class ProfileVerificationPanel {
  @Input() progress = 0;
  @Input() steps: VerificationStep[] = [];
  @Input() code = '';
  @Input() requested = false;
  @Input() pending = false;
  @Input() sending = false;
  @Input() confirming = false;

  @Output() codeChange = new EventEmitter<string>();
  @Output() verificationRequested = new EventEmitter<void>();
  @Output() verificationConfirmed = new EventEmitter<void>();
}
