import {
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  startOfDay,
  differenceInDays,
  parseISO,
} from 'date-fns';
import timeEntryModel from '../models/timeEntry.js';
import taskModel from '../models/task.js';
import projectModel from '../models/project.js';
import clientRateHistory from '../models/clientRateHistory.js';
import {calculateDuration, retriveYYYYMMDD, formatDecimalHoursToHHmm} from '../utils.js';

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

const getMonthDateRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDateStr: retriveYYYYMMDD(startDate),
    endDateStr: retriveYYYYMMDD(endDate),
    daysInMonth: endDate.getDate(),
    currentDay: now.getDate(),
  };
};

const getDaysLeft = () => {
  const today = startOfDay(new Date());
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({start: today, end: monthEnd});
  const workingDays = days.filter(d => !isWeekend(d)).length;

  return {workingDays, calendarDays: days.length};
};

const pricingService = {
  getTaskEarnings: async (taskId, startDate, endDate) => {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

    const task = await taskModel.selectById(taskId);
    if (!task) return null;

    const project = await projectModel.selectById(task.project_id);
    if (!project) return null;

    const rates = await clientRateHistory.getRatesInRange(
      project.client_id,
      startDate,
      endDate,
    );

    const currentRate = await clientRateHistory.getCurrentRate(
      project.client_id,
    );
    if (!currentRate)
      return {hourlyRate: null, earnings: null, currency: 'PLN'};

    const entries = await timeEntryModel.selectByTaskIdWithDateRange(
      taskId,
      startDate,
      endDate,
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
      dateRangeDays: days,
    };
  },

  getProjectEarnings: async (projectId, startDate, endDate) => {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

    const project = await projectModel.selectById(projectId);
    if (!project) return null;

    const rates = await clientRateHistory.getRatesInRange(
      project.client_id,
      startDate,
      endDate,
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
        startDate,
        endDate,
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
      dateRangeDays: days,
      taskCount: tasks.length,
    };
  },

  getClientEarnings: async (clientId, startDate, endDate) => {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

    const rates = await clientRateHistory.getRatesInRange(
      clientId,
      startDate,
      endDate,
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
          startDate,
          endDate,
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
      dateRangeDays: days,
      projectCount: projects.length,
      taskCount,
    };
  },

  getClientMonthlyTarget: async (clientId, targetHours = 170) => {
    const {startDateStr, endDateStr} = getMonthDateRange();
    const {workingDays: workingDaysLeft, calendarDays: calendarDaysLeft} =
      getDaysLeft();

    const projects = await projectModel.selectByCliId(clientId);

    let totalSeconds = 0;

    for (const project of projects) {
      const tasks = await taskModel.selectByProjectId(project.id);

      for (const task of tasks) {
        const entries = await timeEntryModel.selectByTaskIdWithDateRange(
          task.id,
          startDateStr,
          endDateStr,
        );
        for (const entry of entries) {
          if (entry.end)
            totalSeconds += calculateDuration(entry.start, entry.end);
        }
      }
    }

    const workedHours = totalSeconds / 3600;
    const remainingHours = Math.max(0, targetHours - workedHours);
    const hoursPerWorkDay =
      workingDaysLeft > 0 ? remainingHours / workingDaysLeft : 0;
    const hoursPerCalDay =
      calendarDaysLeft > 0 ? remainingHours / calendarDaysLeft : 0;

    return {
      targetHours,
      workedSeconds: totalSeconds,
      workedHours,
      workingDaysLeft,
      calendarDaysLeft,
      remainingHours,
      hoursPerWorkDay:formatDecimalHoursToHHmm(hoursPerWorkDay),
      hoursPerCalDay: formatDecimalHoursToHHmm(hoursPerCalDay),
    };
  },
};

export default pricingService;
