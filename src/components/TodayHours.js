import React, {useState, useEffect} from 'react';

import {Text} from 'ink';

import taskService from '../services/taskService.js';
import {useNavigation} from '../contexts/NavigationContext.js';

const TodayHours = ({selectedDate}) => {
  const {selectedProjectId} = useNavigation();
  const [todayHours, setTodayHours] = useState({hours: 0, minutes: 0});

  useEffect(() => {
    const loadTodayHours = async () => {
      try {
        const tasks = await taskService.getTasksByProjectAndDate(
          selectedProjectId,
          selectedDate,
        );
        const timeSpent = taskService.calculateTimeSpend(tasks);
        setTodayHours(timeSpent);
      } catch (error) {
        console.error('Error loading today hours:', error);
      }
    };

    if (selectedProjectId) {
      loadTodayHours();
    } else {
      setTodayHours({hours: 0, minutes: 0});
    }
  }, [selectedDate, selectedProjectId]);

  if (todayHours.hours > 0 || todayHours.minutes > 0)
    return (
      <Text>
        ({todayHours.hours}h {todayHours.minutes}m)
      </Text>
    );

  return null;
};

export default TodayHours;
