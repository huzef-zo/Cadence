import { strings } from '../i18n/en';
import { computeBarWidthPercentage } from '../logic/chart';

export interface BarItem {
  label: string;
  count: number;
}

export interface BarListProps {
  title: string;
  items: BarItem[];
}

export function BarList({ title, items }: BarListProps) {
  if (items.length === 0) return null;

  const maxCount = Math.max(...items.map((item) => item.count), 0);
  const summaryAriaLabel = strings.barListAriaLabel(title, items.length);

  return (
    <div className="chart-card">
      <div
        className="bar-list"
        role="img"
        aria-label={summaryAriaLabel}
      >
        {items.map((item, idx) => {
          const widthPct = computeBarWidthPercentage(item.count, maxCount);
          return (
            <div key={`${item.label}-${idx}`} className="bar-list__row">
              <span className="bar-list__label">{item.label}</span>
              <div className="bar-list__bar-track">
                <div
                  className="bar-list__bar-fill"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="bar-list__value">{item.count}</span>
            </div>
          );
        })}
      </div>

      <details className="chart-card__details">
        <summary className="chart-card__summary">{strings.showDataTable}</summary>
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">{strings.tableHeaderLabel}</th>
              <th scope="col">{strings.tableHeaderCount}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={`${item.label}-${idx}`}>
                <td>{item.label}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
