import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce values (e.g. search input queries)
 * Prevents unnecessary re-filtering on every keystroke.
 */
export function useDebounce(value, delayMs = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
