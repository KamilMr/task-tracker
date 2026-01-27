import timeEntryModel from '../models/timeEntry.js';
import taskModel from '../models/task.js';
import projectModel from '../models/project.js';
import clientRateHistory from '../models/clientRateHistory.js';
import {calculateDuration, retriveYYYYMMDD} from '../utils.js';

const getDateRange = (dateRangeDays = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRangeDays);
  return {
    startDateStr: retriveYYYYMMDD(startDate),
    endDateStr: retriveYYYYMMDD(endDate),
  };
};

// Find the applicable rate for a given date from sorted rate periods
const findRateForDate = (rates, date) => {
  const dateStr = typeof date === 'string' ? date : retriveYYYYMMDD(date);
  // rates are sorted ascending by effective_from
  // find the last rate where effective_from <= date
  let applicableRate = null;
  for (const rate of rates) {
    const effectiveStr =
      typeof rate.effective_from === 'string'
        ? rate.effective_from.split('T')[0]
        : retriveYYYYMMDD(new Date(rate.effective_from));
    if (effectiveStr <= dateStr) applicableRate = rate;
    else break;
  }
  return applicableRate;
};

// Calculate earnings for entries using rate history
const calculateEntriesEarnings = (entries, rates) => {
  let totalSeconds = 0;
  let totalEarnings = 0;
  let currency = 'PLN';

  for (const entry of entries) {
    if (!entry.end) continue; // Skip active entries

    const duration = calculateDuration(entry.start, entry.end);
    totalSeconds += duration;

    const rate = findRateForDate(rates, entry.start);
    if (rate) {
      const hours = duration / 3600;
      totalEarnings += hours * rate.hourly_rate;
      currency = rate.currency || 'PLN';
    }
  }

  return {totalSeconds, totalEarnings, currency};
};

const pricingService = {
  getTaskEarnings: async (taskId, dateRangeDays = 30) => {
    const task = await taskModel.selectById(taskId);
    if (!task) return null;

    const project = await projectModel.selectById(task.project_id);
    if (!project) return null;

    const {startDateStr, endDateStr} = getDateRange(dateRangeDays);

    // Get rate history for the date range
    const rates = await clientRateHistory.getRatesInRange(
      project.client_id,
      startDateStr,
      endDateStr,
    );

    const currentRate = await clientRateHistory.getCurrentRate(
      project.client_id,
    );
    if (!currentRate)
      return {hourlyRate: null, earnings: null, currency: 'PLN'};

    const entries = await timeEntryModel.selectByTaskIdWithDateRange(
      taskId,
      startDateStr,
      endDateStr,
    );

    const {totalSeconds, totalEarnings, currency} = calculateEntriesEarnings(
      entries,
      rates,
    );
    const hours = totalSeconds / 3600;

    return {
      hourlyRate: currentRate.hourly_rate,
      totalSeconds,
      hours,
      earnings: totalEarnings,
      currency,
      dateRangeDays,
    };
  },

  getProjectEarnings: async (projectId, dateRangeDays = 30) => {
    const project = await projectModel.selectById(projectId);
    if (!project) return null;

    const {startDateStr, endDateStr} = getDateRange(dateRangeDays);

    const rates = await clientRateHistory.getRatesInRange(
      project.client_id,
      startDateStr,
      endDateStr,
    );

    const currentRate = await clientRateHistory.getCurrentRate(
      project.client_id,
    );
    if (!currentRate)
      return {hourlyRate: null, earnings: null, currency: 'PLN'};

    const tasks = await taskModel.selectByProjectId(projectId);

    let totalSeconds = 0;
    let totalEarnings = 0;
    let currency = 'PLN';

    for (const task of tasks) {
      const entries = await timeEntryModel.selectByTaskIdWithDateRange(
        task.id,
        startDateStr,
        endDateStr,
      );
      const result = calculateEntriesEarnings(entries, rates);
      totalSeconds += result.totalSeconds;
      totalEarnings += result.totalEarnings;
      currency = result.currency;
    }

    return {
      hourlyRate: currentRate.hourly_rate,
      totalSeconds,
      hours: totalSeconds / 3600,
      earnings: totalEarnings,
      currency,
      dateRangeDays,
      taskCount: tasks.length,
    };
  },

  getClientEarnings: async (clientId, dateRangeDays = 30) => {
    const {startDateStr, endDateStr} = getDateRange(dateRangeDays);

    const rates = await clientRateHistory.getRatesInRange(
      clientId,
      startDateStr,
      endDateStr,
    );

    const currentRate = await clientRateHistory.getCurrentRate(clientId);
    if (!currentRate)
      return {hourlyRate: null, earnings: null, currency: 'PLN'};

    const projects = await projectModel.selectByCliId(clientId);

    let totalSeconds = 0;
    let totalEarnings = 0;
    let taskCount = 0;

    for (const project of projects) {
      const tasks = await taskModel.selectByProjectId(project.id);
      taskCount += tasks.length;

      for (const task of tasks) {
        const entries = await timeEntryModel.selectByTaskIdWithDateRange(
          task.id,
          startDateStr,
          endDateStr,
        );
        const result = calculateEntriesEarnings(entries, rates);
        totalSeconds += result.totalSeconds;
        totalEarnings += result.totalEarnings;
      }
    }

    return {
      hourlyRate: currentRate.hourly_rate,
      totalSeconds,
      hours: totalSeconds / 3600,
      earnings: totalEarnings,
      currency: currentRate.currency || 'PLN',
      dateRangeDays,
      projectCount: projects.length,
      taskCount,
    };
  },
};

export default pricingService;
