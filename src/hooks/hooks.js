import {useState, useEffect, useRef, useCallback} from 'react';

export const usePolling = (fetcher, deps = [], interval = 30000) => {
  const [data, setData] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refetch = useCallback(async () => {
    const result = await fetcherRef.current();
    setData(result ?? null);
  }, []);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, interval);
    return () => clearInterval(id);
  }, [...deps, interval]);

  return [data, refetch];
};

