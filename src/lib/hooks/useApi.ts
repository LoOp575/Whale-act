"use client";

import { useState, useEffect } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Simple hook to fetch from internal API with fallback to mock data.
 * If API fails, returns fallbackData instead of crashing.
 */
export function useApi<T>(url: string, fallbackData: T): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(url);
        const json = await res.json();

        if (!cancelled) {
          if (json.success && json.data) {
            setData(json.data);
          } else {
            // API returned but no valid data — use fallback
            setData(fallbackData);
          }
          setLoading(false);
        }
      } catch {
        // Network error or API unreachable — use fallback
        if (!cancelled) {
          setData(fallbackData);
          setError("API unavailable — showing cached data");
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error };
}
