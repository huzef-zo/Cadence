import { useI18n } from '../i18n';
import {
  computeLineChartPoints,
  computePathData,
  DEFAULT_LINE_CHART_DIMENSIONS,
  type Point,
} from '../logic/chart';

export interface LineChartProps {
  title: string;
  points: Point[];
  yMin: number;
  yMax: number;
  unitLabel?: string;
}

export function LineChart({ title, points, yMin, yMax, unitLabel }: LineChartProps) {
  const { t } = useI18n();
  if (points.length === 0) return null;

  const dims = DEFAULT_LINE_CHART_DIMENSIONS;
  const coords = computeLineChartPoints(points, yMin, yMax, dims);
  const pathData = computePathData(coords);

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  const firstValFormatted = unitLabel ? `${firstPoint.value} ${unitLabel}` : `${firstPoint.value}`;
  const lastValFormatted = unitLabel ? `${lastPoint.value} ${unitLabel}` : `${lastPoint.value}`;

  const summaryAriaLabel = t.lineChartAriaLabel(
    title,
    points.length,
    `${firstPoint.label}: ${firstValFormatted}`,
    `${lastPoint.label}: ${lastValFormatted}`,
  );

  return (
    <div className="chart-card">
      <div
        className="chart-card__svg-container"
        role="img"
        aria-label={summaryAriaLabel}
      >
        <svg
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Y-axis grid line references */}
          <line
            x1={dims.paddingLeft}
            y1={dims.paddingTop}
            x2={dims.width - dims.paddingRight}
            y2={dims.paddingTop}
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1={dims.paddingLeft}
            y1={dims.height - dims.paddingBottom}
            x2={dims.width - dims.paddingRight}
            y2={dims.height - dims.paddingBottom}
            stroke="var(--color-border)"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          <text
            x={dims.paddingLeft - 6}
            y={dims.paddingTop + 4}
            fill="var(--color-text-muted)"
            fontSize="10"
            textAnchor="end"
          >
            {yMax}
          </text>
          <text
            x={dims.paddingLeft - 6}
            y={dims.height - dims.paddingBottom + 4}
            fill="var(--color-text-muted)"
            fontSize="10"
            textAnchor="end"
          >
            {yMin}
          </text>

          {/* Line path */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data point markers */}
          {coords.map((coord, idx) => (
            <circle
              key={`${coord.label}-${idx}`}
              cx={coord.x}
              cy={coord.y}
              r="4"
              fill="var(--color-surface-raised)"
              stroke="var(--color-brand)"
              strokeWidth="2"
            />
          ))}

          {/* X-axis first and last labels */}
          {coords.length > 0 && (
            <>
              <text
                x={coords[0].x}
                y={dims.height - 8}
                fill="var(--color-text-muted)"
                fontSize="10"
                textAnchor="start"
              >
                {firstPoint.label}
              </text>
              {coords.length > 1 && (
                <text
                  x={coords[coords.length - 1].x}
                  y={dims.height - 8}
                  fill="var(--color-text-muted)"
                  fontSize="10"
                  textAnchor="end"
                >
                  {lastPoint.label}
                </text>
              )}
            </>
          )}
        </svg>
      </div>

      <details className="chart-card__details">
        <summary className="chart-card__summary">{t.showDataTable}</summary>
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">{t.tableHeaderLabel}</th>
              <th scope="col">{t.tableHeaderValue}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, idx) => (
              <tr key={`${p.label}-${idx}`}>
                <td>{p.label}</td>
                <td>{unitLabel ? `${p.value} ${unitLabel}` : p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
