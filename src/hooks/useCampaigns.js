import { useCallback, useEffect, useState } from 'react';
import { listCampaigns } from '../api/campaigns.js';

// Loads the campaign list for the landing page / campaign list screen.
// Usage: const { items, total, loading, error, reload } = useCampaigns({ page, categoryId, status });
export function useCampaigns({ page = 1, limit = 10, categoryId, status } = {}) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = JSON.stringify([page, limit, categoryId, status, reloadKey]);
  const [result, setResult] = useState({ key: null, items: [], total: 0, error: null });

  useEffect(() => {
    let cancelled = false;

    listCampaigns({ page, limit, categoryId, status })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, items: data.items, total: data.total, error: null });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, items: [], total: 0, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [page, limit, categoryId, status, requestKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items: result.items,
    total: result.total,
    error: result.error,
    loading: result.key !== requestKey,
    reload,
  };
}
