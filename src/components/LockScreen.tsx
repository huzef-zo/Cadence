import { useState, type FormEvent } from 'react';
import { useI18n } from '../i18n';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '../logic/config';
import { verifyPin } from '../logic/lock';

interface LockScreenProps {
  lockHash: string;
  lockSalt: string;
  onUnlock: () => void;
}

export function LockScreen({ lockHash, lockSalt, onUnlock }: LockScreenProps) {
  const { t } = useI18n();
  const [pin, setPin] = useState('');
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const correct = await verifyPin(pin, lockSalt, lockHash);
    setBusy(false);
    if (correct) {
      onUnlock();
    } else {
      setWrong(true);
      setPin('');
    }
  }

  return (
    <div className="lock">
      <form className="lock__form" onSubmit={handleSubmit}>
        <h1 className="app-title">{t.appName}</h1>
        <label className="field__label" htmlFor="lock-pin">{t.lockTitle}</label>
        <input
          id="lock-pin"
          className="input input--pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          onChange={(event) => {
            setPin(event.target.value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH));
            setWrong(false);
          }}
        />
        {wrong && <p className="error" role="alert">{t.lockWrong}</p>}
        <button type="submit" className="btn btn--primary" disabled={busy || pin.length < PIN_MIN_LENGTH}>
          {t.lockUnlock}
        </button>
      </form>
    </div>
  );
}
