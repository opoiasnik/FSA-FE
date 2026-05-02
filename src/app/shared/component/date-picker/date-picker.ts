import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  computed,
  signal
} from '@angular/core';

interface DayCell {
  day: number;
  date: Date;
  current: boolean;
  disabled: boolean;
  selected: boolean;
  today: boolean;
}

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss'
})
export class DatePicker {
  @Input() set value(v: Date | null) {
    this._value.set(v);
    if (v) {
      this.viewYear.set(v.getFullYear());
      this.viewMonth.set(v.getMonth());
      this.hour.set(v.getHours());
      this.minute.set(v.getMinutes());
    }
  }

  @Input() minDate: Date | null = null;
  @Input() placeholder = 'Select date and time';
  @Input() showTime = true;

  @Output() readonly valueChange = new EventEmitter<Date | null>();

  @ViewChild('trigger', { static: true }) triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') panelRef?: ElementRef<HTMLDivElement>;

  private readonly _value = signal<Date | null>(null);
  readonly open = signal(false);
  readonly panelTop = signal(0);
  readonly panelLeft = signal(0);

  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());
  readonly hour = signal(12);
  readonly minute = signal(0);

  readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly displayValue = computed(() => {
    const v = this._value();
    if (!v) return '';
    const dd = String(v.getDate()).padStart(2, '0');
    const mm = String(v.getMonth() + 1).padStart(2, '0');
    const yyyy = v.getFullYear();
    if (!this.showTime) return `${dd}.${mm}.${yyyy}`;
    const hh = String(v.getHours()).padStart(2, '0');
    const min = String(v.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  });

  readonly grid = computed<DayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - startWeekday);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const min = this.minDate ? new Date(this.minDate) : null;
    if (min) min.setHours(0, 0, 0, 0);
    const selected = this._value();

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push({
        day: d.getDate(),
        date: d,
        current: d.getMonth() === month,
        disabled: !!min && d < min,
        selected: !!selected
            && d.getFullYear() === selected.getFullYear()
            && d.getMonth() === selected.getMonth()
            && d.getDate() === selected.getDate(),
        today: d.getTime() === today.getTime()
      });
    }
    return cells;
  });

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  toggle(): void {
    const next = !this.open();
    if (next) this.updatePanelPosition();
    this.open.set(next);
  }

  private updatePanelPosition(): void {
    const rect = this.triggerRef.nativeElement.getBoundingClientRect();
    const panelHeight = 380;
    const panelWidth = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < panelHeight && rect.top > panelHeight;
    const top = placeAbove ? rect.top - panelHeight - 6 : rect.bottom + 6;
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 8);
    this.panelTop.set(top);
    this.panelLeft.set(Math.max(8, left));
  }

  prevMonth(): void {
    let m = this.viewMonth() - 1;
    let y = this.viewYear();
    if (m < 0) { m = 11; y--; }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  nextMonth(): void {
    let m = this.viewMonth() + 1;
    let y = this.viewYear();
    if (m > 11) { m = 0; y++; }
    this.viewMonth.set(m);
    this.viewYear.set(y);
  }

  selectDay(cell: DayCell): void {
    if (cell.disabled) return;
    const d = new Date(cell.date);
    d.setHours(this.hour(), this.minute(), 0, 0);
    this._value.set(d);
    this.valueChange.emit(d);
    if (!this.showTime) this.open.set(false);
  }

  setHour(value: string): void {
    const n = Math.max(0, Math.min(23, Number(value) || 0));
    this.hour.set(n);
    this.applyTime();
  }

  setMinute(value: string): void {
    const n = Math.max(0, Math.min(59, Number(value) || 0));
    this.minute.set(n);
    this.applyTime();
  }

  private applyTime(): void {
    const current = this._value();
    if (!current) return;
    const d = new Date(current);
    d.setHours(this.hour(), this.minute(), 0, 0);
    this._value.set(d);
    this.valueChange.emit(d);
  }

  clear(event: Event): void {
    event.stopPropagation();
    this._value.set(null);
    this.valueChange.emit(null);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    const insideHost = this.host.nativeElement.contains(target);
    const insidePanel = !!this.panelRef?.nativeElement.contains(target);
    if (!insideHost && !insidePanel) {
      this.open.set(false);
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onWindowChange(): void {
    if (this.open()) this.updatePanelPosition();
  }
}
