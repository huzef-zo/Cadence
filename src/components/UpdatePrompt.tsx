import { useRegisterSW } from 'virtual:pwa-register/react';
import { useI18n } from '../i18n';

// "Update available" prompt (spec section 8).
export function UpdatePrompt() {
  const { t } = useI18n();
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  if (!needRefresh[0]) return null;
  return (
    <div className="banner" role="status">
      <p>{t.updateAvailable}</p>
      <button type="button" className="btn btn--primary" onClick={() => updateServiceWorker(true)}>
        {t.updateReload}
      </button>
    </div>
  );
}
