import { useState } from 'react';
import { useI18n } from '../i18n';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { createPeriod, deletePeriod, updatePeriod } from '../db/queries';
import { Sheet } from './Sheet';
import { today } from '../logic/dates';
import { validatePeriod } from '../logic/validation';
import type { Period } from '../db/types';

interface PeriodSheetProps {
  onClose: () => void;
}

type Editing = Period | 'new' | null;

export function PeriodSheet({ onClose }: PeriodSheetProps) {
  const { t, formatDay } = useI18n();
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
    const existing = await db.periods.toArray();
    const validation = validatePeriod(start, endDate, existing, ignoreId);
    if (validation === 'overlap') { setError(t.errorPeriodOverlap); return; }
    if (validation === 'end-before-start') { setError(t.errorEndBeforeStart); return; }
    if (editing === 'new') {
      await createPeriod(start, endDate);
    } else if (editing !== null) {
      await updatePeriod({ ...editing, startDate: start, endDate });
    }
    setEditing(null);
  }

  async function handleDelete(period: Period) {
    // Delete confirmation (spec 4.1).
    if (!window.confirm(t.deletePeriodConfirm)) return;
    await deletePeriod(period.id);
  }

  const sorted = [...(periods ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <Sheet
      title={editing === null ? t.periodsTitle : editing === 'new' ? t.addPeriod : t.editPeriod}
      onClose={onClose}
    >
      {editing === null ? (
        <>
          <button type="button" className="btn btn--primary" onClick={() => openEdit('new')}>
            {t.addPeriod}
          </button>
          {sorted.length === 0 && <p className="card__note">{t.noPeriods}</p>}
          <ul className="entry-list">
            {sorted.map((period) => (
              <li key={period.id} className="period-row">
                <span>
                  {formatDay(period.startDate)} – {period.endDate !== null ? formatDay(period.endDate) : t.periodOngoing}
                </span>
                <span className="period-row__actions">
                  <button type="button" className="btn btn--ghost" onClick={() => openEdit(period)}>{t.edit}</button>
                  <button type="button" className="btn btn--ghost" onClick={() => handleDelete(period)}>{t.delete}</button>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {error !== null && <p className="error" role="alert">{error}</p>}
          <div className="field">
            <label className="field__label" htmlFor="period-start">{t.periodStartLabel}</label>
            <input id="period-start" className="input" type="date" value={start} max={today()} onChange={(event) => setStart(event.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="period-end">{t.periodEndLabel}</label>
            <input id="period-end" className="input" type="date" value={end} min={start || undefined} onChange={(event) => setEnd(event.target.value)} />
          </div>
          <div className="actions">
            <button type="button" className="btn btn--primary" disabled={start === ''} onClick={handleSave}>{t.save}</button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>{t.cancel}</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
