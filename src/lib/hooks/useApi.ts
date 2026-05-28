"use client";

import { useState, useEffect } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: string | null;
}

export function useApi<T>(url: string, fallbackData: T): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || !json.success) {
          setData(fallbackData);
          setError(json.message || json.error || "API request failed");
          setSource(json.source || "error");
          setLoading(false);
          return;
        }

        const payload = json.data ?? json.rows ?? fallbackData;
        setData(payload);
        setError(null);
        setSource(json.source || "api");
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setData(fallbackData);
          setError(err instanceof Error ? err.message : "API unavailable");
          setSource("network-error");
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error, source };
}
