import { useState } from 'react';
import { CycleCard } from '../components/CycleCard';
import { InsightsView } from '../components/InsightsView';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { useI18n } from '../i18n';
import { deriveCycles } from '../logic/cycles';
import { mean } from '../logic/stats';

export function History() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'cycles' | 'insights'>('cycles');
  const periods = useLiveQuery(() => db.periods.toArray(), []);
  const entries = useLiveQuery(() => db.entries.toArray(), []);

  if (!periods || !entries) {
    return (
      <main className="screen">
        <h1 className="screen__title">{t.tabHistory}</h1>
      </main>
    );
  }

  const cycles = deriveCycles(periods).slice().reverse(); // newest first
  const completed = cycles.filter((cycle) => cycle.cycleLength !== null);
  const averageCycle =
    completed.length > 0 ? Math.round(mean(completed.map((cycle) => cycle.cycleLength as number))) : null;
  const withPeriodLength = cycles.filter((cycle) => cycle.periodLength !== null);
  const averagePeriod =
    withPeriodLength.length > 0 ? Math.round(mean(withPeriodLength.map((cycle) => cycle.periodLength as number))) : null;

  return (
    <main className="screen">
      <h1 className="screen__title">{t.tabHistory}</h1>

      <div className="segmented-control" role="group">
        <button
          type="button"
          className={`segmented-control__btn ${activeTab === 'cycles' ? 'segmented-control__btn--selected' : ''}`}
          aria-pressed={activeTab === 'cycles'}
          onClick={() => setActiveTab('cycles')}
        >
          {t.segmentCycles}
        </button>
        <button
          type="button"
          className={`segmented-control__btn ${activeTab === 'insights' ? 'segmented-control__btn--selected' : ''}`}
          aria-pressed={activeTab === 'insights'}
          onClick={() => setActiveTab('insights')}
        >
          {t.segmentInsights}
        </button>
      </div>

      {activeTab === 'cycles' ? (
        cycles.length === 0 ? (
          <p>{t.noCycles}</p>
        ) : (
          <>
            <div className="summary">
              <div className="summary__item">
                <p className="summary__value">{averageCycle !== null ? t.days(averageCycle) : t.notAvailable}</p>
                <p className="summary__label">{t.summaryAvgCycleLength}</p>
              </div>
              <div className="summary__item">
                <p className="summary__value">{averagePeriod !== null ? t.days(averagePeriod) : t.notAvailable}</p>
                <p className="summary__label">{t.summaryAvgPeriodLength}</p>
              </div>
              <div className="summary__item">
                <p className="summary__value">{cycles.length}</p>
                <p className="summary__label">{t.summaryCyclesLogged}</p>
              </div>
            </div>
            {cycles.map((cycle) => (
              <CycleCard key={cycle.startDate} cycle={cycle} entries={entries} />
            ))}
          </>
        )
      ) : (
        <InsightsView cycles={cycles} entries={entries} />
      )}
    </main>
  );
}
