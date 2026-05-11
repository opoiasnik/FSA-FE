import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type AuthRole = 'USER' | 'OWNER';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.html',
  styleUrl: './role-selector.scss',
})
export class RoleSelector {
  @Input({ required: true }) value!: AuthRole;
  @Output() valueChange = new EventEmitter<AuthRole>();

  select(role: AuthRole): void {
    this.valueChange.emit(role);
  }
}
