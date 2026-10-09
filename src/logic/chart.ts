export interface Point {
  label: string;
  value: number;
}

export interface ChartCoordinate {
  x: number;
  y: number;
  label: string;
  value: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
}

export const DEFAULT_LINE_CHART_DIMENSIONS: ChartDimensions = {
  width: 300,
  height: 150,
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 30,
  paddingLeft: 35,
};

export function computeLineChartPoints(
  points: Point[],
  yMin: number,
  yMax: number,
  dimensions: ChartDimensions = DEFAULT_LINE_CHART_DIMENSIONS,
): ChartCoordinate[] {
  if (points.length === 0) return [];

  const { width, height, paddingTop, paddingRight, paddingBottom, paddingLeft } = dimensions;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

  return points.map((p, index) => {
    let x: number;
    if (points.length === 1) {
      x = paddingLeft + plotWidth / 2;
    } else {
      x = paddingLeft + (index / (points.length - 1)) * plotWidth;
    }

    const clampedValue = Math.max(yMin, Math.min(yMax, p.value));
    const normalizedY = (clampedValue - yMin) / yRange;
    const y = paddingTop + plotHeight * (1 - normalizedY);

    return {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      label: p.label,
      value: p.value,
    };
  });
}

export function computePathData(coordinates: ChartCoordinate[]): string {
  if (coordinates.length === 0) return '';
  return coordinates
    .map((coord, idx) => `${idx === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
    .join(' ');
}

export function computeBarWidthPercentage(value: number, max: number): number {
  if (max <= 0) return 0;
  const percentage = (value / max) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));
}
