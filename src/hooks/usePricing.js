import {useState, useEffect} from 'react';
import pricingService from '../services/pricingService.js';

const usePricing = (
  taskId,
  projectId,
  clientId,
  startDate,
  endDate,
  reload,
) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if ((!taskId && !projectId && !clientId) || !startDate || !endDate) {
      setPricing(null);
      return;
    }

    let cancelled = false;

    const fetchPricing = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = null;
        if (taskId)
          data = await pricingService.getTaskEarnings(
            taskId,
            startDate,
            endDate,
          );
        else if (projectId)
          data = await pricingService.getProjectEarnings(
            projectId,
            startDate,
            endDate,
          );
        else if (clientId)
          data = await pricingService.getClientEarnings(
            clientId,
            startDate,
            endDate,
          );
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
    return () => {
      cancelled = true;
    };
  }, [taskId, projectId, clientId, startDate, endDate, reload]);

  return {pricing, loading, error};
};

export default usePricing;
