import type { DayEntry } from '../db/types';
import { flowLabels, strings, tagLabels } from '../i18n/en';
import {
  averageByCycleDay,
  cycleLengthSeries,
  cycleSummary,
  flowDistribution,
  periodLengthSeries,
  topSymptoms,
} from '../logic/insights';
import type { Cycle } from '../logic/types';
import { BarList } from './BarList';
import { LineChart } from './LineChart';

export interface InsightsViewProps {
  cycles: Cycle[];
  entries: DayEntry[];
}

export function InsightsView({ cycles, entries }: InsightsViewProps) {
  const summary = cycleSummary(cycles);
  const cycleTrend = cycleLengthSeries(cycles);
  const periodTrend = periodLengthSeries(cycles);
  const painData = averageByCycleDay(cycles, entries, 'pain');
  const moodData = averageByCycleDay(cycles, entries, 'mood');
  const symptoms = topSymptoms(entries);
  const flow = flowDistribution(entries);

  const cycleTrendPoints = cycleTrend.map((pt) => ({ label: pt.startDate, value: pt.value }));
  const periodTrendPoints = periodTrend.map((pt) => ({ label: pt.startDate, value: pt.value }));
  const painPoints = painData.map((pt) => ({ label: `Day ${pt.day}`, value: pt.average }));
  const moodPoints = moodData.map((pt) => ({ label: `Day ${pt.day}`, value: pt.average }));

  const symptomBarItems = symptoms.map((s) => ({
    label: tagLabels[s.key] || s.key,
    count: s.count,
  }));

  const flowBarItems = (['spotting', 'light', 'medium', 'heavy'] as const)
    .map((key) => ({
      label: flowLabels[key],
      count: flow[key],
    }))
    .filter((item) => item.count > 0 || Object.values(flow).some((c) => c > 0));

  const hasFlowData = Object.values(flow).some((c) => c > 0);

  return (
    <div className="insights-view">
      {/* 3a. Summary line */}
      <section className="insights-section">
        {summary ? (
          <p className="insights-summary">
            {strings.insightsSummary(summary.average, summary.min, summary.max, summary.count)}
          </p>
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3b. Cycle length trend */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingCycleLengthTrend}</h2>
        {cycleTrendPoints.length >= 2 ? (
          <LineChart
            title={strings.insightsHeadingCycleLengthTrend}
            points={cycleTrendPoints}
            yMin={Math.min(...cycleTrendPoints.map((p) => p.value))}
            yMax={Math.max(...cycleTrendPoints.map((p) => p.value))}
            unitLabel="days"
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3c. Period length trend */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingPeriodLengthTrend}</h2>
        {periodTrendPoints.length >= 2 ? (
          <LineChart
            title={strings.insightsHeadingPeriodLengthTrend}
            points={periodTrendPoints}
            yMin={Math.min(...periodTrendPoints.map((p) => p.value))}
            yMax={Math.max(...periodTrendPoints.map((p) => p.value))}
            unitLabel="days"
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3d. Pain across the cycle */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingPainAcrossCycle}</h2>
        {painPoints.length > 0 ? (
          <LineChart
            title={strings.insightsHeadingPainAcrossCycle}
            points={painPoints}
            yMin={0}
            yMax={10}
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3e. Mood across the cycle */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingMoodAcrossCycle}</h2>
        {moodPoints.length > 0 ? (
          <LineChart
            title={strings.insightsHeadingMoodAcrossCycle}
            points={moodPoints}
            yMin={1}
            yMax={5}
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3f. Top symptoms */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingTopSymptoms}</h2>
        {symptomBarItems.length > 0 ? (
          <BarList
            title={strings.insightsHeadingTopSymptoms}
            items={symptomBarItems}
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* 3g. Flow distribution */}
      <section className="insights-section">
        <h2 className="insights-section__title">{strings.insightsHeadingFlowDistribution}</h2>
        {hasFlowData ? (
          <BarList
            title={strings.insightsHeadingFlowDistribution}
            items={flowBarItems}
          />
        ) : (
          <p className="insights-empty">{strings.insightsKeepLogging}</p>
        )}
      </section>

      {/* Bottom disclaimer note */}
      <footer className="insights-footer">
        <p className="insights-disclaimer">{strings.insightsDisclaimer}</p>
      </footer>
    </div>
  );
}
