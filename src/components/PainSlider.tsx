import { useI18n } from '../i18n';

interface PainSliderProps {
  value: number | null; // 0–10, or null when not recorded
  onChange: (value: number | null) => void;
}

export function PainSlider({ value, onChange }: PainSliderProps) {
  const { t } = useI18n();
  const recording = value !== null;
  return (
    <fieldset className="field">
      <legend className="field__label">{t.logPain}</legend>
      <label className="check">
        <input type="checkbox" checked={recording} onChange={(event) => onChange(event.target.checked ? 5 : null)} />
        <span>{t.painRecord}</span>
      </label>
      {recording && (
        <>
          <input
            className="slider"
            type="range"
            min={0}
            max={10}
            step={1}
            value={value ?? 0}
            aria-label={t.logPain}
            aria-valuetext={t.painValue(value ?? 0)}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <div className="slider__scale" aria-hidden="true">
            <span>0</span>
            <span>10</span>
          </div>
          <output className="field__value">{t.painValue(value ?? 0)}</output>
        </>
      )}
    </fieldset>
  );
}
