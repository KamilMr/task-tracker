import {useState, useEffect} from 'react';
import analyticsService from '../services/analyticsService.js';

const useTaskAnalytics = (taskId, dateRangeDays = 7) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) {
      setAnalytics(null);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analyticsService.getTaskAnalytics(taskId, dateRangeDays);
        setAnalytics(data);
      } catch (err) {
        setError(err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [taskId, dateRangeDays]);

  return {analytics, loading, error};
};

export default useTaskAnalytics;
