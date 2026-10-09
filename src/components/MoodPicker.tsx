import { strings } from '../i18n/en';

type Mood = 1 | 2 | 3 | 4 | 5;

const MOOD_OPTIONS: { value: Mood | null; label: string }[] = [
  { value: null, label: strings.fieldNotSet },
  { value: 1, label: strings.moodVeryLow },
  { value: 2, label: strings.moodLow },
  { value: 3, label: strings.moodNeutral },
  { value: 4, label: strings.moodGood },
  { value: 5, label: strings.moodGreat },
];

interface MoodPickerProps {
  value: Mood | null;
  onChange: (value: Mood | null) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <fieldset className="field">
      <legend className="field__label">{strings.logMood}</legend>
      <div className="chip-group">
        {MOOD_OPTIONS.map((option) => (
          <label key={option.label} className={`chip${value === option.value ? ' chip--on' : ''}`}>
            <input
              type="radio"
              name="mood"
              className="chip__input"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
