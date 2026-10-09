import { useState } from 'react';
import { strings } from '../i18n/en';
import { db } from '../db/db';
import { createPeriod, getSettings } from '../db/queries';
import { today } from '../logic/dates';
import { validatePeriod } from '../logic/validation';

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [lastStart, setLastStart] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [periodLength, setPeriodLength] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    const cycle = cycleLength === '' ? null : Number(cycleLength);
    const period = periodLength === '' ? null : Number(periodLength);
    const invalid =
      (cycleLength !== '' && (cycle === null || !Number.isFinite(cycle) || cycle <= 0)) ||
      (periodLength !== '' && (period === null || !Number.isFinite(period) || period <= 0));
    if (invalid) {
      setError(strings.onboardingInvalidNumber);
      return;
    }
    if (lastStart !== '') {
      const validation = validatePeriod(lastStart, null, await db.periods.toArray());
      if (validation === 'overlap') {
        setError(strings.errorPeriodOverlap);
        return;
      }
      await createPeriod(lastStart, null);
    }
    const settings = await getSettings();
    await db.settings.put({
      ...settings,
      typicalCycleLength: cycle,
      typicalPeriodLength: period,
      onboardingDone: true,
    });
  }

  return (
    <main className="screen onboarding">
      {step === 0 && (
        <section className="card">
          <h1 className="screen__title">{strings.onboardingStep1Title}</h1>
          <p>{strings.onboardingStep1Body}</p>
        </section>
      )}
      {step === 1 && (
        <section className="card">
          <h1 className="screen__title">{strings.onboardingStep2Title}</h1>
          <p className="card__note">{strings.onboardingStep2Body}</p>
          <div className="field">
            <label className="field__label" htmlFor="ob-last">{strings.onboardingLastPeriodStart}</label>
            <input
              id="ob-last"
              className="input"
              type="date"
              value={lastStart}
              max={today()}
              onChange={(event) => setLastStart(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ob-cycle">{strings.onboardingTypicalCycleLength}</label>
            <input
              id="ob-cycle"
              className="input"
              type="number"
              min={1}
              inputMode="numeric"
              value={cycleLength}
              onChange={(event) => setCycleLength(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ob-period">{strings.onboardingTypicalPeriodLength}</label>
            <input
              id="ob-period"
              className="input"
              type="number"
              min={1}
              inputMode="numeric"
              value={periodLength}
              onChange={(event) => setPeriodLength(event.target.value)}
            />
          </div>
        </section>
      )}
      {step === 2 && (
        <section className="card">
          <h1 className="screen__title">{strings.onboardingStep3Title}</h1>
          <p>{strings.disclaimer}</p>
        </section>
      )}
      {error !== null && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        {step > 0 && (
          <button type="button" className="btn btn--secondary" onClick={() => setStep(step - 1)}>
            {strings.onboardingBack}
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setError(null);
              setStep(step + 1);
            }}
          >
            {strings.onboardingNext}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={finish}>
            {strings.onboardingAcknowledge}
          </button>
        )}
      </div>
    </main>
  );
      }
