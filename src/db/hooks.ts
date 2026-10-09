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
      error: () => {
        /* keep the last value */
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
