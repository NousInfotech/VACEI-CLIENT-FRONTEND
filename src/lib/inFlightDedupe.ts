type Entry<T> = {
  promise: Promise<T>;
  startedAt: number;
};

const inFlight = new Map<string, Entry<any>>();

/**
 * Deduplicate concurrent calls by key. If the same key is requested while the
 * first call is in-flight, the same promise is returned.
 */
export function dedupeInFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key) as Entry<T> | undefined;
  if (existing) return existing.promise;

  const entry: Entry<T> = {
    startedAt: Date.now(),
    promise: Promise.resolve()
      .then(fn)
      .finally(() => {
        // Only clear if it's still the same promise stored
        const cur = inFlight.get(key);
        if (cur?.promise === entry.promise) {
          inFlight.delete(key);
        }
      }),
  };

  inFlight.set(key, entry);
  return entry.promise;
}

/** For debugging/testing if needed. */
export function __getInFlightKeys(): string[] {
  return Array.from(inFlight.keys());
}

