import { useRegisterSW } from 'virtual:pwa-register/react';
import { strings } from '../i18n/en';

// "Update available" prompt (spec section 8).
export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  if (!needRefresh[0]) return null;
  return (
    <div className="banner" role="status">
      <p>{strings.updateAvailable}</p>
      <button type="button" className="btn btn--primary" onClick={() => updateServiceWorker(true)}>
        {strings.updateReload}
      </button>
    </div>
  );
}
