import { useI18n } from '../i18n';

type Mood = 1 | 2 | 3 | 4 | 5;

interface MoodPickerProps {
  value: Mood | null;
  onChange: (value: Mood | null) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const { t } = useI18n();

  const moodOptions: { value: Mood | null; label: string }[] = [
    { value: null, label: t.fieldNotSet },
    { value: 1, label: t.moodVeryLow },
    { value: 2, label: t.moodLow },
    { value: 3, label: t.moodNeutral },
    { value: 4, label: t.moodGood },
    { value: 5, label: t.moodGreat },
  ];

  return (
    <fieldset className="field">
      <legend className="field__label">{t.logMood}</legend>
      <div className="chip-group">
        {moodOptions.map((option) => (
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
