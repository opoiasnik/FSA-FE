import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-pagination.html',
  styleUrls: ['./app-pagination.scss']
})
export class AppPagination {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() disabled = false;
  @Input() ariaLabel = 'Pagination';

  @Output() pageChange = new EventEmitter<number>();

  visiblePages(): number[] {
    if (this.totalPages <= 1) {
      return [];
    }

    const start = Math.max(0, Math.min(this.page - 2, this.totalPages - 5));
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, index) => start + index);
  }

  goTo(page: number): void {
    const lastPage = Math.max(this.totalPages - 1, 0);
    const nextPage = Math.max(0, Math.min(page, lastPage));
    if (this.disabled || nextPage === this.page) {
      return;
    }

    this.pageChange.emit(nextPage);
  }
}
