import { strings } from '../i18n/en';

interface PainSliderProps {
  value: number | null; // 0–10, or null when not recorded
  onChange: (value: number | null) => void;
}

export function PainSlider({ value, onChange }: PainSliderProps) {
  const recording = value !== null;
  return (
    <fieldset className="field">
      <legend className="field__label">{strings.logPain}</legend>
      <label className="check">
        <input type="checkbox" checked={recording} onChange={(event) => onChange(event.target.checked ? 5 : null)} />
        <span>{strings.painRecord}</span>
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
            aria-label={strings.logPain}
            aria-valuetext={strings.painValue(value ?? 0)}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <div className="slider__scale" aria-hidden="true">
            <span>0</span>
            <span>10</span>
          </div>
          <output className="field__value">{strings.painValue(value ?? 0)}</output>
        </>
      )}
    </fieldset>
  );
}
