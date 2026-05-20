import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 80;

interface ChartData {
  linePath: string;
  fillPath: string;
  gridY: number[];
  yMax: number;
  yMid: number;
  xLabels: string[];
  hasData: boolean;
}

interface HoveredPoint {
  pct: number;
  svgX: number;
  svgY: number;
  date: string;
  views: number;
}

@Component({
  selector: 'app-owner-views-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-views-chart.html',
  styleUrls: ['./owner-views-chart.scss']
})
export class OwnerViewsChart {
  @Input() trend: number[] | null | undefined = [];

  readonly hoveredPoint = signal<HoveredPoint | null>(null);

  get total(): number {
    return this.trend?.reduce((a, b) => a + b, 0) ?? 0;
  }

  get chart(): ChartData {
    const trend = this.trend;
    const empty: ChartData = { linePath: '', fillPath: '', gridY: [], yMax: 0, yMid: 0, xLabels: [], hasData: false };
    if (!trend || trend.length < 2 || !trend.some(v => v > 0)) return empty;

    const max = Math.max(...trend, 1);
    const yMax = max <= 10 ? max : Math.ceil(max / 5) * 5;
    const yMid = Math.round(yMax / 2);

    const toX = (i: number) => (i / (trend.length - 1)) * CHART_WIDTH;
    const toY = (v: number) => CHART_HEIGHT - (v / yMax) * CHART_HEIGHT;
    const points: [number, number][] = trend.map((value, index) => [toX(index), toY(value)]);

    let line = `M ${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1];
      const [x1, y1] = points[i];
      const cx = (x0 + x1) / 2;
      line += ` C ${cx.toFixed(2)},${y0.toFixed(2)} ${cx.toFixed(2)},${y1.toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`;
    }

    return {
      linePath: line,
      fillPath: `${line} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`,
      gridY: [0, CHART_HEIGHT / 2, CHART_HEIGHT],
      yMax,
      yMid,
      xLabels: this.xLabels(trend.length),
      hasData: true
    };
  }

  onChartMove(event: MouseEvent): void {
    const trend = this.trend;
    if (!trend || !trend.some(v => v > 0)) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const index = Math.round(pct * (trend.length - 1));
    const snappedPct = index / (trend.length - 1);
    const max = Math.max(...trend, 1);
    const yMax = max <= 10 ? max : Math.ceil(max / 5) * 5;

    this.hoveredPoint.set({
      pct: snappedPct,
      svgX: snappedPct * CHART_WIDTH,
      svgY: CHART_HEIGHT - (trend[index] / yMax) * CHART_HEIGHT,
      date: this.dateLabel(trend.length - 1 - index),
      views: trend[index]
    });
  }

  onChartLeave(): void {
    this.hoveredPoint.set(null);
  }

  tooltipTransform(pct: number): string {
    if (pct < 0.12) return 'translateX(0)';
    if (pct > 0.88) return 'translateX(-100%)';
    return 'translateX(-50%)';
  }

  private xLabels(length: number): string[] {
    return [this.dateLabel(length - 1), this.dateLabel(Math.floor((length - 1) / 2)), 'Today'];
  }

  private dateLabel(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }
}
