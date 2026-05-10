import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type FilterChipType = 'range' | 'rooms' | 'toggle' | 'enum';

export interface RangeValue  { min: number | null; max: number | null }
export type FilterChipValue  = RangeValue | number | boolean | string | null;

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-chip.html',
  styleUrl:    './filter-chip.scss',
})
export class FilterChip {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) type!: FilterChipType;

  @Input() unit = '';
  @Input() options: (string | number)[] = [];
  @Input() sliderMin = 0;
  @Input() sliderMax = 5000;
  @Input() step = 50;

  @Input() set value(v: FilterChipValue) { this._syncFromParent(v); }

  @Output() readonly apply = new EventEmitter<FilterChipValue>();
  @Output() readonly clear  = new EventEmitter<void>();

  @ViewChild('trigger', { static: true }) triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('panel')                     panelRef?: ElementRef<HTMLDivElement>;

  readonly open      = signal(false);
  readonly panelTop  = signal(0);
  readonly panelLeft = signal(0);

  readonly rangeMin  = signal<number | null>(null);
  readonly rangeMax  = signal<number | null>(null);
  readonly picked    = signal<string | number | boolean | null>(null);

  readonly sliderLo = computed(() => this.rangeMin() ?? this.sliderMin);
  readonly sliderHi = computed(() => this.rangeMax() ?? this.sliderMax);

  readonly fillLeft  = computed(() =>
    ((this.sliderLo() - this.sliderMin) / (this.sliderMax - this.sliderMin)) * 100);
  readonly fillWidth = computed(() =>
    ((this.sliderHi() - this.sliderLo()) / (this.sliderMax - this.sliderMin)) * 100);

  readonly active = computed(() => {
    if (this.type === 'range') return this.rangeMin() != null || this.rangeMax() != null;
    return this.picked() != null;
  });

  readonly summary = computed<string>(() => {
    switch (this.type) {
      case 'range': {
        const min = this.rangeMin();
        const max = this.rangeMax();
        if (min == null && max == null) return '';
        const lo = (min ?? this.sliderMin).toLocaleString();
        const hi = (max ?? this.sliderMax).toLocaleString();
        return `${lo} – ${hi}${this.unit ? ' ' + this.unit : ''}`;
      }
      case 'rooms':  return this.picked() != null ? `${this.picked()}+` : '';
      case 'toggle':
        if (this.picked() === true)  return 'Yes';
        if (this.picked() === false) return 'No';
        return '';
      case 'enum': return this.picked() != null ? String(this.picked()) : '';
    }
  });

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  onSliderLo(raw: string): void {
    this.rangeMin.set(Math.min(Number(raw), this.sliderHi() - this.step));
  }

  onSliderHi(raw: string): void {
    this.rangeMax.set(Math.max(Number(raw), this.sliderLo() + this.step));
  }

  toggle(): void {
    const next = !this.open();
    if (next) this._updatePosition();
    this.open.set(next);
  }

  emitRange(): void {
    this.apply.emit({ min: this.rangeMin(), max: this.rangeMax() });
  }

  selectOption(val: string | number | boolean): void {
    const next = this.picked() === val ? null : val;
    this.picked.set(next);
    this.apply.emit(next);
  }

  onClear(): void {
    this.rangeMin.set(null);
    this.rangeMax.set(null);
    this.picked.set(null);
    this.clear.emit();
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const t = event.target as Node;
    if (!this.host.nativeElement.contains(t) &&
        !this.panelRef?.nativeElement.contains(t)) {
      this.open.set(false);
    }
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onReposition(): void { if (this.open()) this._updatePosition(); }

  private _updatePosition(): void {
    const rect       = this.triggerRef.nativeElement.getBoundingClientRect();
    const panelH     = 220;
    const panelW     = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top  = spaceBelow < panelH && rect.top > panelH
                   ? rect.top - panelH - 6
                   : rect.bottom + 6;
    this.panelTop.set(top);
    this.panelLeft.set(Math.max(8, Math.min(rect.left, window.innerWidth - panelW - 8)));
  }

  private _syncFromParent(v: FilterChipValue): void {
    if (this.type === 'range' && v != null && typeof v === 'object') {
      this.rangeMin.set((v as RangeValue).min);
      this.rangeMax.set((v as RangeValue).max);
    } else {
      this.picked.set(v as string | number | boolean | null);
    }
  }
}
