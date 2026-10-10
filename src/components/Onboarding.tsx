import { useState } from 'react';
import { ENABLED_LANGUAGES, LANGUAGE_NAMES, useI18n } from '../i18n';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { createPeriod, getSettings, saveSettings } from '../db/queries';
import type { Settings } from '../db/types';
import { today } from '../logic/dates';
import { validatePeriod } from '../logic/validation';

export function Onboarding() {
  const { t } = useI18n();
  const settings = useLiveQuery(() => getSettings(), []);
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
      setError(t.onboardingInvalidNumber);
      return;
    }
    if (lastStart !== '') {
      const validation = validatePeriod(lastStart, null, await db.periods.toArray());
      if (validation === 'overlap') {
        setError(t.errorPeriodOverlap);
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
          {ENABLED_LANGUAGES.length > 1 && (
            <div className="field">
              <label className="field__label" htmlFor="ob-language">{t.languageLabel}</label>
              <select
                id="ob-language"
                className="input"
                value={settings?.language ?? 'system'}
                onChange={async (event) => {
                  const language = event.target.value as Settings['language'];
                  const current = await getSettings();
                  await saveSettings({ ...current, language });
                }}
              >
                <option value="system">{t.languageSystem}</option>
                {ENABLED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {LANGUAGE_NAMES[lang]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <h1 className="screen__title">{t.onboardingStep1Title}</h1>
          <p>{t.onboardingStep1Body}</p>
        </section>
      )}
      {step === 1 && (
        <section className="card">
          <h1 className="screen__title">{t.onboardingStep2Title}</h1>
          <p className="card__note">{t.onboardingStep2Body}</p>
          <div className="field">
            <label className="field__label" htmlFor="ob-last">{t.onboardingLastPeriodStart}</label>
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
            <label className="field__label" htmlFor="ob-cycle">{t.onboardingTypicalCycleLength}</label>
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
            <label className="field__label" htmlFor="ob-period">{t.onboardingTypicalPeriodLength}</label>
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
          <h1 className="screen__title">{t.onboardingStep3Title}</h1>
          <p>{t.disclaimer}</p>
        </section>
      )}
      {error !== null && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        {step > 0 && (
          <button type="button" className="btn btn--secondary" onClick={() => setStep(step - 1)}>
            {t.onboardingBack}
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
            {t.onboardingNext}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={finish}>
            {t.onboardingAcknowledge}
          </button>
        )}
      </div>
    </main>
  );
}
