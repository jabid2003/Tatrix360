'use client';

import { useEffect, useState, useCallback } from 'react';

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/csrf')
      .then((r) => r.json())
      .then((d) => setToken(d.token))
      .catch(() => {});
  }, []);

  const authedFetch = useCallback(
    async (url: string, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (token) headers.set('x-csrf-token', token);
      return fetch(url, { ...init, headers });
    },
    [token]
  );

  return { token, authedFetch };
}
