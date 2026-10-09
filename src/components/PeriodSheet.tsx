import { useState } from 'react';
import { strings } from '../i18n/en';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { createPeriod, deletePeriod, updatePeriod } from '../db/queries';
import { Sheet } from './Sheet';
import { formatDayLong, today } from '../logic/dates';
import { validatePeriod } from '../logic/validation';
import type { Period } from '../db/types';

interface PeriodSheetProps {
  onClose: () => void;
}

type Editing = Period | 'new' | null;

export function PeriodSheet({ onClose }: PeriodSheetProps) {
  const periods = useLiveQuery(() => db.periods.toArray(), []);
  const [editing, setEditing] = useState<Editing>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  function openEdit(target: Editing) {
    setEditing(target);
    setStart(target !== null && target !== 'new' ? target.startDate : '');
    setEnd(target !== null && target !== 'new' && target.endDate !== null ? target.endDate : '');
    setError(null);
  }

  async function handleSave() {
    if (start === '') return;
    const endDate = end === '' ? null : end;
    const ignoreId = editing !== null && editing !== 'new' ? editing.id : undefined;
    const validation = await validatePeriod(start, endDate, db.periods.toArray(), ignoreId);
    if (validation === 'overlap') { setError(strings.errorPeriodOverlap); return; }
    if (validation === 'end-before-start') { setError(strings.errorEndBeforeStart); return; }
    if (editing === 'new') {
      await createPeriod(start, endDate);
    } else if (editing !== null) {
      await updatePeriod({ ...editing, startDate: start, endDate });
    }
    setEditing(null);
  }

  async function handleDelete(period: Period) {
    // Delete confirmation (spec 4.1).
    if (!window.confirm(strings.deletePeriodConfirm)) return;
    await deletePeriod(period.id);
  }

  const sorted = [...(periods ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <Sheet
      title={editing === null ? strings.periodsTitle : editing === 'new' ? strings.addPeriod : strings.editPeriod}
      onClose={onClose}
    >
      {editing === null ? (
        <>
          <button type="button" className="btn btn--primary" onClick={() => openEdit('new')}>
            {strings.addPeriod}
          </button>
          {sorted.length === 0 && <p className="card__note">{strings.noPeriods}</p>}
          <ul className="entry-list">
            {sorted.map((period) => (
              <li key={period.id} className="period-row">
                <span>
                  {formatDayLong(period.startDate)} – {period.endDate !== null ? formatDayLong(period.endDate) : strings.periodOngoing}
                </span>
                <span className="period-row__actions">
                  <button type="button" className="btn btn--ghost" onClick={() => openEdit(period)}>{strings.edit}</button>
                  <button type="button" className="btn btn--ghost" onClick={() => handleDelete(period)}>{strings.delete}</button>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {error !== null && <p className="error" role="alert">{error}</p>}
          <div className="field">
            <label className="field__label" htmlFor="period-start">{strings.periodStartLabel}</label>
            <input id="period-start" className="input" type="date" value={start} max={today()} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="period-end">{strings.periodEndLabel}</label>
            <input id="period-end" className="input" type="date" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn--primary" disabled={start === ''} onClick={handleSave}>{strings.save}</button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>{strings.cancel}</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
