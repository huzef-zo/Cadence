import { useState, type ChangeEvent, type FormEvent } from 'react';
import { strings } from '../i18n/en';
import { db } from '../db/db';
import { useLiveQuery } from '../db/hooks';
import { getSettings, saveSettings } from '../db/queries';
import {
  applyBackup,
  downloadText,
  exportBackup,
  readBackupFile,
  type BackupFile,
  type ImportMode,
} from '../db/backup';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../logic/config';
import { deriveCycles } from '../logic/cycles';
import { today } from '../logic/dates';
import { generateSalt, hashPin, isValidPin } from '../logic/lock';
import { cyclesToCsv, summaryFilename } from '../logic/summary';
import type { Settings as SettingsData } from '../db/types';

export function Settings() {
  const settings = useLiveQuery(() => getSettings(), []);
  const [status, setStatus] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<BackupFile | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [deleteText, setDeleteText] = useState('');

  if (!settings) {
    return (
      <main className="screen">
        <h1 className="screen__title">{strings.tabSettings}</h1>
      </main>
    );
  }

  const notificationsSupported = typeof Notification !== 'undefined';
  const permission = notificationsSupported ? Notification.permission : 'denied';

  async function patchSettings(patch: Partial<SettingsData>) {
    await saveSettings({ ...settings, ...patch });
  }

  async function patchReminders(patch: Partial<SettingsData['reminders']>) {
    await patchSettings({ reminders: { ...settings.reminders, ...patch } });
  }

  async function requestPermissionIfNeeded(): Promise<boolean> {
    if (!notificationsSupported) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'default') {
      return (await Notification.requestPermission()) === 'granted';
    }
    return false;
  }

  async function handleExport() {
    await exportBackup(db);
    await patchSettings({ lastExportReminderAt: today() });
    setStatus(strings.dataExportDone);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const backup = await readBackupFile(file);
    if (backup === null) {
      setStatus(strings.dataImportInvalid);
      return;
    }
    setPendingImport(backup); // ask merge or replace (spec 4.8)
    setStatus(null);
  }

  async function handleImport(mode: ImportMode) {
    if (pendingImport === null) return;
    if (mode === 'replace' && !window.confirm(strings.dataImportReplaceConfirm)) return;
    const result = await applyBackup(db, pendingImport, mode);
    setPendingImport(null);
    setStatus(strings.dataImportResult(result.periods, result.entries));
  }

  async function handleSummary() {
    const csv = cyclesToCsv(deriveCycles(await db.periods.toArray()));
    downloadText(summaryFilename(), csv, 'text/csv');
  }

  async function handleDeleteAll() {
    await Promise.all([db.periods.clear(), db.entries.clear(), db.settings.clear()]);
  }

  async function handleSavePin(event: FormEvent) {
    event.preventDefault();
    if (!isValidPin(pin, PIN_MIN_LENGTH, PIN_MAX_LENGTH)) {
      setStatus(strings.lockInvalid);
      return;
    }
    if (pin !== confirmPin) {
      setStatus(strings.lockMismatch);
      return;
    }
    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    await patchSettings({ lockEnabled: true, lockHash: hash, lockSalt: salt });
    setPin('');
    setConfirmPin('');
    setStatus(strings.lockSaved);
  }

  async function handleDisableLock() {
    if (!window.confirm(strings.lockDisableConfirm)) return;
    await patchSettings({ lockEnabled: false, lockHash: null, lockSalt: null });
  }

  return (
    <main className="screen">
      <h1 className="screen__title">{strings.tabSettings}</h1>
      {status !== null && <p className="status" role="status">{status}</p>}

      <section className="card" aria-label={strings.sectionPattern}>
        <h2 className="card__heading">{strings.sectionPattern}</h2>
        <div className="field">
          <label className="field__label" htmlFor="override">{strings.overrideLabel}</label>
          <select
            id="override"
            className="input"
            value={settings.regularityOverride}
            onChange={(event) => patchSettings({ regularityOverride: event.target.value as SettingsData['regularityOverride'] })}
          >
            <option value="auto">{strings.overrideAuto}</option>
            <option value="regular">{strings.overrideRegular}</option>
            <option value="irregular">{strings.overrideIrregular}</option>
          </select>
          <p className="field__hint">{strings.overrideHint}</p>
        </div>
      </section>

      <section className="card" aria-label={strings.sectionReminders}>
        <h2 className="card__heading">{strings.sectionReminders}</h2>
        {!notificationsSupported && <p className="card__note">{strings.remindersUnsupported}</p>}
        {notificationsSupported && permission === 'denied' && (
          <p className="card__note">{strings.remindersPermissionNeeded}</p>
        )}
        {notificationsSupported && (
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.reminders.periodSoon}
                onChange={async (event) => {
                  if (event.target.checked && !(await requestPermissionIfNeeded())) return;
                  await patchReminders({ periodSoon: event.target.checked });
                }}
              />
              <span>{strings.periodSoonToggle}</span>
            </label>
            {settings.reminders.periodSoon && (
              <div className="field">
                <label className="field__label" htmlFor="days-before">{strings.daysBeforeLabel}</label>
                <input
                  id="days-before"
                  className="input"
                  type="number"
                  min={0}
                  max={7}
                  value={settings.reminders.daysBefore}
                  onChange={(event) =>
                    patchReminders({ daysBefore: Math.max(0, Math.min(7, Number(event.target.value) || 0)) })
                  }
                />
              </div>
            )}
            <label className="check">
              <input
                type="checkbox"
                checked={settings.reminders.dailyLog}
                onChange={async (event) => {
                  if (event.target.checked && !(await requestPermissionIfNeeded())) return;
                  await patchReminders({ dailyLog: event.target.checked });
                }}
              />
              <span>{strings.dailyLogToggle}</span>
            </label>
            {settings.reminders.dailyLog && (
              <div className="field">
                <label className="field__label" htmlFor="daily-time">{strings.dailyTimeLabel}</label>
                <input
                  id="daily-time"
                  className="input"
                  type="time"
                  value={settings.reminders.dailyTime ?? ''}
                  onChange={(event) => patchReminders({ dailyTime: event.target.value === '' ? null : event.target.value })}
                />
              </div>
            )}
          </>
        )}
      </section>

      <section className="card" aria-label={strings.sectionLock}>
        <h2 className="card__heading">{strings.sectionLock}</h2>
        {settings.lockEnabled ? (
          <button type="button" className="btn btn--secondary" onClick={handleDisableLock}>
            {strings.lockDisable}
          </button>
        ) : (
          <>
            <p className="card__note">{strings.lockWarning}</p>
            <form className="form-grid" onSubmit={handleSavePin}>
              <div className="field">
                <label className="field__label" htmlFor="lock-pin">{strings.lockPinLabel}</label>
                <input
                  id="lock-pin"
                  className="input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH))}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="lock-pin-confirm">{strings.lockConfirmLabel}</label>
                <input
                  id="lock-pin-confirm"
                  className="input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH))}
                />
              </div>
              <button type="submit" className="btn btn--primary">{strings.save}</button>
            </form>
          </>
        )}
      </section>

      <section className="card" aria-label={strings.sectionTheme}>
        <h2 className="card__heading">{strings.sectionTheme}</h2>
        <div className="field">
          <label className="field__label" htmlFor="theme">{strings.sectionTheme}</label>
          <select
            id="theme"
            className="input"
            value={settings.theme}
            onChange={(event) => patchSettings({ theme: event.target.value as SettingsData['theme'] })}
          >
            <option value="system">{strings.themeSystem}</option>
            <option value="light">{strings.themeLight}</option>
            <option value="dark">{strings.themeDark}</option>
          </select>
        </div>
      </section>

      <section className="card" aria-label={strings.sectionData}>
        <h2 className="card__heading">{strings.sectionData}</h2>
        <div className="actions">
          <button type="button" className="btn btn--secondary" onClick={handleExport}>
            {strings.dataExport}
          </button>
          <label className="btn btn--secondary">
            {strings.dataImport}
            <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={handleImportFile} />
          </label>
          {pendingImport !== null && (
            <>
              <button type="button" className="btn btn--primary" onClick={() => handleImport('merge')}>
                {strings.dataImportMerge}
              </button>
              <button type="button" className="btn btn--danger" onClick={() => handleImport('replace')}>
                {strings.dataImportReplace}
              </button>
            </>
          )}
          <button type="button" className="btn btn--secondary" onClick={handleSummary}>
            {strings.shareSummary}
          </button>
        </div>

        <h3 className="card__subheading">{strings.dataDelete}</h3>
        <p className="card__note">{strings.dataDeleteWarning}</p>
        <div className="field">
          <label className="field__label" htmlFor="delete-confirm">{strings.dataDeleteTypeLabel}</label>
          <input
            id="delete-confirm"
            className="input"
            value={deleteText}
            autoComplete="off"
            onChange={(event) => setDeleteText(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn--danger"
          disabled={deleteText !== 'DELETE'}
          onClick={handleDeleteAll}
        >
          {strings.dataDeleteButton}
        </button>
      </section>

      <section className="card" aria-label={strings.sectionAbout}>
        <h2 className="card__heading">{strings.sectionAbout}</h2>
        <p>{strings.appName} · {strings.aboutVersion} {__APP_VERSION__}</p>
        <p>{strings.aboutLicense}: {strings.aboutLicenseValue}</p>
        <p><a href={strings.sourceRepoUrl}>{strings.aboutSource}</a></p>
        <p>{strings.disclaimer}</p>
        <p>{strings.privacyStatement}</p>
      </section>
    </main>
  );
        }
