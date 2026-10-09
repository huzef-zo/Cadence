import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { moodTagKeys, painTagKeys, symptomKeys } from '../i18n/keys';
import { Sheet } from './Sheet';
import { MoodPicker } from './MoodPicker';
import { PainSlider } from './PainSlider';
import { getEntry, saveEntry } from '../db/queries';
import type { Flow } from '../db/types';
import { NOTE_MAX_LENGTH } from '../logic/config';

interface LogSheetProps {
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export function LogSheet({ date, onClose }: LogSheetProps) {
  const { t, formatDay } = useI18n();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [pain, setPain] = useState<number | null>(null);
  const [painTags, setPainTags] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [loaded, setLoaded] = useState(false);

  const flowOptions: { value: Flow | null; label: string }[] = [
    { value: null, label: t.fieldNotSet },
    { value: 'none', label: t.flowNone },
    { value: 'spotting', label: t.flowSpotting },
    { value: 'light', label: t.flowLight },
    { value: 'medium', label: t.flowMedium },
    { value: 'heavy', label: t.flowHeavy },
  ];

  useEffect(() => {
    let cancelled = false;
    getEntry(date).then((existing) => {
      if (cancelled) return;
      if (existing) {
        setFlow(existing.flow);
        setMood(existing.mood);
        setMoodTags([...existing.moodTags]);
        setPain(existing.pain);
        setPainTags([...existing.painTags]);
        setSymptoms([...existing.symptoms]);
        setNote(existing.note);
      }
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  function toggle(list: string[], setList: (next: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((item) => item !== tag) : [...list, tag]);
  }

  async function handleSave() {
    await saveEntry(date, {
      flow,
      mood,
      moodTags,
      pain,
      painTags,
      symptoms,
      note: note.slice(0, NOTE_MAX_LENGTH),
    });
    onClose();
  }

  return (
    <Sheet title={t.logTitle(formatDay(date))} onClose={onClose}>
      {loaded && (
        <div className="form-grid">
          <fieldset className="field">
            <legend className="field__label">{t.logFlow}</legend>
            <div className="chip-group">
              {flowOptions.map((option) => (
                <label key={option.label} className={`chip${flow === option.value ? ' chip--on' : ''}`}>
                  <input
                    type="radio"
                    name="flow"
                    className="chip__input"
                    checked={flow === option.value}
                    onChange={() => setFlow(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <MoodPicker value={mood} onChange={setMood} />

          <TagGroup
            label={t.moodTagsLabel}
            options={moodTagKeys}
            selected={moodTags}
            onToggle={(tag) => toggle(moodTags, setMoodTags, tag)}
          />

          <PainSlider value={pain} onChange={setPain} />

          <TagGroup
            label={t.painTagsLabel}
            options={painTagKeys}
            selected={painTags}
            onToggle={(tag) => toggle(painTags, setPainTags, tag)}
          />

          <TagGroup
            label={t.symptomsLabel}
            options={symptomKeys}
            selected={symptoms}
            onToggle={(tag) => toggle(symptoms, setSymptoms, tag)}
          />

          <div className="field">
            <label className="field__label" htmlFor="log-note">{t.logNote}</label>
            <textarea
              id="log-note"
              className="input"
              maxLength={NOTE_MAX_LENGTH}
              value={note}
              placeholder={t.logNotePlaceholder}
              onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX_LENGTH))}
            />
            <p className="field__hint">{t.noteRemaining(NOTE_MAX_LENGTH - note.length)}</p>
          </div>

          <button type="button" className="btn btn--primary" onClick={handleSave}>
            {t.save}
          </button>
        </div>
      )}
    </Sheet>
  );
}

interface TagGroupProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (tag: string) => void;
}

function TagGroup({ label, options, selected, onToggle }: TagGroupProps) {
  const { t } = useI18n();
  return (
    <fieldset className="field">
      <legend className="field__label">{label}</legend>
      <div className="chip-group">
        {options.map((tag) => (
          <label key={tag} className={`chip${selected.includes(tag) ? ' chip--on' : ''}`}>
            <input
              type="checkbox"
              className="chip__input"
              checked={selected.includes(tag)}
              onChange={() => onToggle(tag)}
            />
            {t.tagLabels[tag] ?? tag}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
