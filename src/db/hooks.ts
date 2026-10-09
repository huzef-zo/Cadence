import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';
import { today } from '../logic/dates';

// Returns current day string (YYYY-MM-DD). Updates when visibility changes or every 60s.
export function useToday(): string {
  const [currentDay, setCurrentDay] = useState(() => today());

  useEffect(() => {
    function checkAndSet() {
      const fresh = today();
      setCurrentDay((prev) => (prev !== fresh ? fresh : prev));
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkAndSet();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = setInterval(checkAndSet, 60_000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  return currentDay;
}

// Subscribes to a Dexie liveQuery (dexie core, no extra package) and
// re-renders when the underlying tables change.
export function useLiveQuery<T>(querier: () => Promise<T> | T, deps: readonly unknown[]): T | undefined {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const subscription = liveQuery(querier).subscribe({
      next: (result) => {
        if (alive) setValue(result);
      },
      error: async (err) => {
        console.error('liveQuery error:', err);
        try {
          const fallback = await querier();
          if (alive) setValue(fallback);
        } catch (fallbackErr) {
          console.error('liveQuery fallback error:', fallbackErr);
        }
      },
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
