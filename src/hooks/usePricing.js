import {useState, useEffect} from 'react';
import pricingService from '../services/pricingService.js';

const usePricing = (taskId, projectId, clientId, dateRangeDays = 30) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId && !projectId && !clientId) {
      setPricing(null);
      return;
    }

    let cancelled = false;

    const fetchPricing = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;
        if (taskId) data = await pricingService.getTaskEarnings(taskId, dateRangeDays);
        else if (projectId) data = await pricingService.getProjectEarnings(projectId, dateRangeDays);
        else if (clientId) data = await pricingService.getClientEarnings(clientId, dateRangeDays);
        if (!cancelled) setPricing(data);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setPricing(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPricing();
    return () => { cancelled = true; };
  }, [taskId, projectId, clientId, dateRangeDays]);

  return {pricing, loading, error};
};

export default usePricing;
