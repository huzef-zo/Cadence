import { useEffect, useRef, useState } from 'react';
import { getSettings } from './db/queries';
import { useLiveQuery } from './db/hooks';
import { LockScreen } from './components/LockScreen';
import { Onboarding } from './components/Onboarding';
import { ReminderHost } from './components/ReminderHost';
import { TabBar, type Tab } from './components/TabBar';
import { UpdatePrompt } from './components/UpdatePrompt';
import { Today } from './screens/Today';
import { Calendar } from './screens/Calendar';
import { History } from './screens/History';
import { Settings } from './screens/Settings';
import { LOCK_BACKGROUND_MS } from './logic/config';

export default function App() {
  const settings = useLiveQuery(() => getSettings(), []);
  const [tab, setTab] = useState<Tab>('today');
  const [locked, setLocked] = useState(true);
  const hiddenAt = useRef<number | null>(null);

  // Lock on app open whenever a lock is enabled (spec 4.9).
  useEffect(() => {
    if (settings?.lockEnabled) setLocked(true);
  }, [settings?.lockEnabled]);

  // Lock again after 60 seconds in the background (spec 4.9).
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        hiddenAt.current = Date.now();
      } else if (hiddenAt.current !== null) {
        const awayFor = Date.now() - hiddenAt.current;
        hiddenAt.current = null;
        if (awayFor >= LOCK_BACKGROUND_MS) setLocked(true);
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Apply the theme setting; "system" follows the media query (tokens.css).
  useEffect(() => {
    const root = document.documentElement;
    if (!settings || settings.theme === 'system') root.removeAttribute('data-theme');
    else root.dataset.theme = settings.theme;
  }, [settings?.theme]);

  if (settings === undefined) return null; // still loading from IndexedDB

  if (settings.lockEnabled && locked && settings.lockHash !== null && settings.lockSalt !== null) {
    return <LockScreen lockHash={settings.lockHash} lockSalt={settings.lockSalt} onUnlock={() => setLocked(false)} />;
  }

  if (!settings.onboardingDone) return <Onboarding />;

  return (
    <div className="app">
      <ReminderHost />
      <UpdatePrompt />
      {tab === 'today' && <Today />}
      {tab === 'calendar' && <Calendar />}
      {tab === 'history' && <History />}
      {tab === 'settings' && <Settings />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
