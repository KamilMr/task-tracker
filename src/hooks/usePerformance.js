import {useState, useEffect, useRef} from 'react';
import {getPerformanceSnapshot} from '../services/performanceService.js';

const POLL_INTERVAL = 10000;

const usePerformance = () => {
  const [metrics, setMetrics] = useState(() => getPerformanceSnapshot());
  const prevRef = useRef(metrics);

  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = getPerformanceSnapshot();
      const prev = prevRef.current;

      setMetrics({
        ...snapshot,
        rssDelta: snapshot.rss - prev.rss,
        heapDelta: snapshot.heapUsed - prev.heapUsed,
      });

      // prevRef.current = snapshot;
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return metrics;
};

export default usePerformance;
