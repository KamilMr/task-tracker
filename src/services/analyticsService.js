import timeEntryModel from '../models/timeEntry.js';
import taskModel from '../models/task.js';
import {
  calculateDuration,
  sumEntryDurations,
  retriveYYYYMMDD,
} from '../utils.js';

const calculateMedian = values => {
  if (!values || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateEstimationAccuracy = (estimatedMinutes, entries) => {
  const completedEntries = entries.filter(e => e.end);
  const actualSeconds = sumEntryDurations(completedEntries);

  if (!estimatedMinutes) {
    return {
      estimatedSeconds: null,
      actualSeconds,
      differenceSeconds: null,
      differencePercent: null,
      isOverBudget: false,
      hasEstimation: false,
    };
  }

  const estimatedSeconds = estimatedMinutes * 60;
  const differenceSeconds = actualSeconds - estimatedSeconds;
  const differencePercent = (differenceSeconds / estimatedSeconds) * 100;

  return {
    estimatedSeconds,
    actualSeconds,
    differenceSeconds,
    differencePercent,
    isOverBudget: differenceSeconds > 0,
    hasEstimation: true,
  };
};

const calculateTimeDistribution = (entries, dateRangeDays = 7) => {
  const completedEntries = entries.filter(e => e.end);

  if (completedEntries.length === 0) {
    return {
      sessionCount: 0,
      avgSessionSeconds: null,
      medianSessionSeconds: null,
      longestSessionSeconds: null,
      shortestSessionSeconds: null,
      longestGapSeconds: null,
      lastActivityDate: null,
      timeSinceLastSeconds: null,
      daysWorked: 0,
      dateRangeDays,
      peakHour: null,
      deepWorkCount: 0,
    };
  }

  const durations = completedEntries.map(e =>
    calculateDuration(e.start, e.end),
  );
  const sortedDurations = [...durations].sort((a, b) => a - b);

  const sortedByStart = [...completedEntries].sort(
    (a, b) => new Date(a.start) - new Date(b.start),
  );

  const gaps = [];
  for (let i = 1; i < sortedByStart.length; i++) {
    const prevEnd = new Date(sortedByStart[i - 1].end);
    const currStart = new Date(sortedByStart[i].start);
    gaps.push(Math.floor((currStart - prevEnd) / 1000));
  }

  const lastEntry = sortedByStart[sortedByStart.length - 1];
  const lastActivityDate = new Date(lastEntry.end || lastEntry.start);
  const timeSinceLastSeconds = Math.floor(
    (new Date() - lastActivityDate) / 1000,
  );

  // Days worked - unique dates with entries
  const uniqueDays = new Set(
    completedEntries.map(e => new Date(e.start).toDateString()),
  );
  const daysWorked = uniqueDays.size;

  // Peak hour - most common start hour
  const hourCounts = {};
  completedEntries.forEach(e => {
    const hour = new Date(e.start).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHour = Object.entries(hourCounts).reduce(
    (max, [hour, count]) =>
      count > max.count ? {hour: parseInt(hour), count} : max,
    {hour: null, count: 0},
  ).hour;

  // Deep work - sessions > 1 hour (3600 seconds)
  const deepWorkCount = durations.filter(d => d >= 3600).length;

  return {
    sessionCount: completedEntries.length,
    avgSessionSeconds: Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length,
    ),
    medianSessionSeconds: calculateMedian(sortedDurations),
    longestSessionSeconds: sortedDurations[sortedDurations.length - 1],
    shortestSessionSeconds: sortedDurations[0],
    longestGapSeconds: gaps.length > 0 ? Math.max(...gaps) : null,
    lastActivityDate,
    timeSinceLastSeconds,
    daysWorked,
    dateRangeDays,
    peakHour,
    deepWorkCount,
  };
};

const calculateBudgetAnalysis = (estimatedMinutes, entries) => {
  const completedEntries = entries.filter(e => e.end);
  const actualSeconds = sumEntryDurations(completedEntries);

  if (!estimatedMinutes) {
    return {
      percentUsed: null,
      remainingSeconds: null,
      overUnderSeconds: null,
      status: 'no_estimation',
    };
  }

  const estimatedSeconds = estimatedMinutes * 60;
  const percentUsed = (actualSeconds / estimatedSeconds) * 100;
  const remainingSeconds = estimatedSeconds - actualSeconds;

  let status = 'on_track';
  if (percentUsed >= 100) status = 'over_budget';
  else if (percentUsed >= 80) status = 'warning';

  return {
    percentUsed,
    remainingSeconds,
    overUnderSeconds: remainingSeconds,
    status,
  };
};

const analyticsService = {
  getTaskAnalytics: async (taskId, dateRangeDays = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRangeDays);

    const startDateStr = retriveYYYYMMDD(startDate);
    const endDateStr = retriveYYYYMMDD(endDate);

    const [task, entries] = await Promise.all([
      taskModel.selectById(taskId),
      timeEntryModel.selectByTaskIdWithDateRange(
        taskId,
        startDateStr,
        endDateStr,
      ),
    ]);

    if (!task) return null;

    const estimatedMinutes = task.estimated_minutes;

    return {
      estimation: calculateEstimationAccuracy(estimatedMinutes, entries),
      distribution: calculateTimeDistribution(entries, dateRangeDays),
      budget: calculateBudgetAnalysis(estimatedMinutes, entries),
      meta: {
        dateRangeDays,
        totalEntriesAnalyzed: entries.length,
      },
    };
  },
};

export default analyticsService;
