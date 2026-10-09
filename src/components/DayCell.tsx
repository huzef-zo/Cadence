import { strings } from '../i18n/en';

export interface DayInfo {
  date: string; // YYYY-MM-DD
  inMonth: boolean;
  isPeriod: boolean;
  isPredicted: boolean;
  hasLog: boolean;
  isToday: boolean;
}

interface DayCellProps {
  day: DayInfo;
  onSelect: (date: string) => void;
}

// Calendar day button. Markers are conveyed by shape/pattern — filled
// background (period), dashed border (predicted), ring (today), dot (has a
// log) — and by the accessible label; never by color alone (spec 4.4 / 2.6).
export function DayCell({ day, onSelect }: DayCellProps) {
  const markers: string[] = [];
  if (day.isPeriod) markers.push(strings.legendPeriod);
  if (day.isPredicted) markers.push(strings.legendPredicted);
  if (day.hasLog) markers.push(strings.legendLogged);
  if (day.isToday) markers.push(strings.legendToday);

  return (
    <button
      type="button"
      className={[
        'daycell',
        day.inMonth ? '' : 'daycell--outside',
        day.isPeriod ? 'daycell--period' : '',
        day.isPredicted ? 'daycell--predicted' : '',
        day.isToday ? 'daycell--today' : '',
        day.hasLog ? 'daycell--has-log' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(day.date)}
      aria-label={[day.date, ...markers].join(', ')}
    >
      <span className="daycell__num">{Number(day.date.slice(8, 10))}</span>
    </button>
  );
}
