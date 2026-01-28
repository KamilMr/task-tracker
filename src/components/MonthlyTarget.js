import React, {useState, useEffect} from 'react';
import {Text} from 'ink';
import pricingService from '../services/pricingService.js';
import {useData} from '../contexts/DataContext.js';

const formatHoursMinutes = seconds => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const MonthlyTarget = ({clientId}) => {
  const {reload} = useData();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!clientId) {
      setData(null);
      return;
    }

    const loadData = async () => {
      const result = await pricingService.getClientMonthlyTarget(clientId);
      setData(result);
    };
    loadData();
  }, [clientId, reload]);

  if (!data) return null;

  const {targetHours, workedHours, workingDaysLeft, hoursPerDayNeeded} = data;
  const dailyNeededSeconds = hoursPerDayNeeded * 3600;

  return (
    <Text dimColor>
      {' - '}
      {Math.floor(workedHours)}h/{targetHours}h / {workingDaysLeft} days left /
      {formatHoursMinutes(dailyNeededSeconds)} work daily
    </Text>
  );
};

export default MonthlyTarget;
