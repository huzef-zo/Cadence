import { liveQuery } from 'dexie';
import { useEffect, useState } from 'react';

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
