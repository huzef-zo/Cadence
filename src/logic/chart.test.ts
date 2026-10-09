import { describe, expect, it } from 'vitest';
import {
  computeBarWidthPercentage,
  computeLineChartPoints,
  computePathData,
  DEFAULT_LINE_CHART_DIMENSIONS,
} from './chart';

describe('chart logic', () => {
  describe('computeLineChartPoints', () => {
    it('returns empty array when points is empty', () => {
      expect(computeLineChartPoints([], 0, 10)).toEqual([]);
    });

    it('centers a single point in the plot area', () => {
      const coords = computeLineChartPoints([{ label: 'Day 1', value: 5 }], 0, 10);
      expect(coords).toHaveLength(1);
      const expectedX =
        DEFAULT_LINE_CHART_DIMENSIONS.paddingLeft +
        (DEFAULT_LINE_CHART_DIMENSIONS.width -
          DEFAULT_LINE_CHART_DIMENSIONS.paddingLeft -
          DEFAULT_LINE_CHART_DIMENSIONS.paddingRight) /
          2;
      expect(coords[0].x).toBe(expectedX);
    });

    it('correctly maps min and max y values to top and bottom padding', () => {
      const points = [
        { label: 'Min', value: 0 },
        { label: 'Max', value: 10 },
      ];
      const coords = computeLineChartPoints(points, 0, 10);
      expect(coords).toHaveLength(2);
      // Value 0 should map to plot bottom (height - paddingBottom)
      expect(coords[0].y).toBe(
        DEFAULT_LINE_CHART_DIMENSIONS.height - DEFAULT_LINE_CHART_DIMENSIONS.paddingBottom,
      );
      // Value 10 should map to plot top (paddingTop)
      expect(coords[1].y).toBe(DEFAULT_LINE_CHART_DIMENSIONS.paddingTop);
    });

    it('clamps values outside yMin and yMax', () => {
      const points = [
        { label: 'Below', value: -5 },
        { label: 'Above', value: 15 },
      ];
      const coords = computeLineChartPoints(points, 0, 10);
      expect(coords[0].y).toBe(
        DEFAULT_LINE_CHART_DIMENSIONS.height - DEFAULT_LINE_CHART_DIMENSIONS.paddingBottom,
      );
      expect(coords[1].y).toBe(DEFAULT_LINE_CHART_DIMENSIONS.paddingTop);
    });
  });

  describe('computePathData', () => {
    it('returns empty string for empty coordinates', () => {
      expect(computePathData([])).toBe('');
    });

    it('generates correct M and L commands', () => {
      const coords = [
        { x: 10, y: 20, label: 'A', value: 1 },
        { x: 30, y: 40, label: 'B', value: 2 },
      ];
      expect(computePathData(coords)).toBe('M 10 20 L 30 40');
    });
  });

  describe('computeBarWidthPercentage', () => {
    it('calculates accurate percentages', () => {
      expect(computeBarWidthPercentage(5, 10)).toBe(50);
      expect(computeBarWidthPercentage(1, 3)).toBe(33.3);
    });

    it('handles 0 or negative max correctly', () => {
      expect(computeBarWidthPercentage(5, 0)).toBe(0);
      expect(computeBarWidthPercentage(5, -10)).toBe(0);
    });

    it('clamps percentages between 0 and 100', () => {
      expect(computeBarWidthPercentage(-5, 10)).toBe(0);
      expect(computeBarWidthPercentage(15, 10)).toBe(100);
    });
  });
});
