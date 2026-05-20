import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ProfileFormModel {
  name: string;
  surname: string;
  email: string;
  phone: string;
  bio: string;
}

@Component({
  selector: 'app-profile-personal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-personal-form.html',
  styleUrls: ['./profile-personal-form.scss']
})
export class ProfilePersonalForm {
  @Input({ required: true }) form!: ProfileFormModel;
  @Input() saving = false;
  @Input() dirty = false;

  @Output() saved = new EventEmitter<void>();
}
