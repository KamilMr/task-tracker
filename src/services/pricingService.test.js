import {describe, it, expect} from 'vitest';
import {computeMonthlyTarget} from './pricingService.js';

const h = hours => hours * 3600;
const hm = (hours, minutes) => hours * 3600 + minutes * 60;

const base = {
  targetHours: 80,
  dailyTarget: null,
  totalSeconds: 0,
  workedTodaySeconds: 0,
  workingDaysLeft: 10,
  calendarDaysLeft: 14,
  isTodayWorkDay: true,
  totalWorkingDays: 10,
};

describe('computeMonthlyTarget', () => {
  describe('hoursPerWorkDay', () => {
    it('10wd, worked 0h - initial target 8h/day', () => {
      const result = computeMonthlyTarget(base);
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(8, 2);
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('10wd, worked 8h today - daily duty met, average unchanged', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(8),
        workedTodaySeconds: h(8),
      });
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(8, 2);
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('10wd, worked 10h today - future average drops, +2h overflow', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(10),
        workedTodaySeconds: h(10),
      });
      // 70 remaining / 9 future days = 7.778
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(70 / 9, 2);
      expect(result.overflowHoursRaw).toBeCloseTo(2, 2);
    });

    it('9wd, worked 0h today - next day, no work, average holds', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(10),
        workedTodaySeconds: 0,
        workingDaysLeft: 9,
      });
      // 70 remaining / 9 days (includes today, no work done)
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(70 / 9, 2);
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('8wd, worked 0h today - skipped day, average rises', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(10),
        workedTodaySeconds: 0,
        workingDaysLeft: 8,
      });
      // 70 remaining / 8 days = 8.75
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(8.75, 2);
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('8wd, worked 8h today - daily duty met, average unchanged', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(18),
        workedTodaySeconds: h(8),
        workingDaysLeft: 8,
      });
      // 62 remaining / 7 future days = 8.857
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(62 / 7, 2);
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('8wd, worked 8:50 today - worked exactly the daily goal', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: hm(18, 50),
        workedTodaySeconds: hm(8, 50),
        workingDaysLeft: 8,
      });
      // remaining = 80 - 18.833 = 61.167, future = 7
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(61.167 / 7, 1);
      // workedToday (8.833) vs baseline (70/8 = 8.75) -> small overflow ~0.083
      expect(result.overflowHoursRaw).toBeCloseTo(0.083, 1);
    });

    it('8wd, worked 9:50 today - +1h extra, future average drops', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: hm(19, 50),
        workedTodaySeconds: hm(9, 50),
        workingDaysLeft: 8,
      });
      // remaining = 80 - 19.833 = 60.167, future = 7
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(60.167 / 7, 1);
      // workedToday (9.833) vs baseline (70/8 = 8.75) -> overflow ~1.083
      expect(result.overflowHoursRaw).toBeCloseTo(1.083, 1);
    });
  });

  describe('edge cases', () => {
    it('last working day, no work done', () => {
      const result = computeMonthlyTarget({
        ...base,
        workingDaysLeft: 1,
        totalSeconds: h(72),
        workedTodaySeconds: 0,
      });
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(8, 2);
    });

    it('last working day, already worked - shows remaining hours', () => {
      const result = computeMonthlyTarget({
        ...base,
        workingDaysLeft: 1,
        totalSeconds: h(76),
        workedTodaySeconds: h(4),
      });
      // 4h remaining, last day, shows remaining directly
      expect(result.hoursPerWorkDayRaw).toBeCloseTo(4, 2);
      expect(result.remainingHours).toBeCloseTo(4, 2);
    });

    it('last working day, target met', () => {
      const result = computeMonthlyTarget({
        ...base,
        workingDaysLeft: 1,
        totalSeconds: h(80),
        workedTodaySeconds: h(8),
      });
      expect(result.hoursPerWorkDayRaw).toBe(0);
      expect(result.remainingHours).toBe(0);
    });

    it('last working day, worked above target', () => {
      const result = computeMonthlyTarget({
        ...base,
        workingDaysLeft: 1,
        totalSeconds: h(82),
        workedTodaySeconds: h(10),
      });
      expect(result.hoursPerWorkDayRaw).toBe(0);
      expect(result.remainingHours).toBe(0);
      expect(result.overflowHoursRaw).toBeCloseTo(2, 2);
    });

    it('weekend - no overflow regardless of work', () => {
      const result = computeMonthlyTarget({
        ...base,
        isTodayWorkDay: false,
        totalSeconds: h(10),
        workedTodaySeconds: h(10),
      });
      expect(result.overflowHoursRaw).toBe(0);
    });

    it('target already exceeded', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(85),
        workedTodaySeconds: h(5),
      });
      expect(result.remainingHours).toBe(0);
      expect(result.hoursPerWorkDayRaw).toBe(0);
    });

    it('0 working days left', () => {
      const result = computeMonthlyTarget({
        ...base,
        workingDaysLeft: 0,
        calendarDaysLeft: 2,
        isTodayWorkDay: false,
      });
      expect(result.hoursPerWorkDayRaw).toBe(0);
    });
  });

  describe('with explicit dailyTarget', () => {
    it('overflow uses dailyTarget as baseline', () => {
      const result = computeMonthlyTarget({
        ...base,
        dailyTarget: 8,
        totalSeconds: h(10),
        workedTodaySeconds: h(10),
      });
      // overflow = 10 - 8 = 2
      expect(result.overflowHoursRaw).toBeCloseTo(2, 2);
    });

    it('no overflow when under dailyTarget', () => {
      const result = computeMonthlyTarget({
        ...base,
        dailyTarget: 8,
        totalSeconds: h(6),
        workedTodaySeconds: h(6),
      });
      expect(result.overflowHoursRaw).toBe(0);
    });
  });

  describe('formatted output', () => {
    it('formats hoursPerWorkDay as HH:mm', () => {
      const result = computeMonthlyTarget(base);
      expect(result.hoursPerWorkDay).toBe('08:00');
    });

    it('formats overflowHours as HH:mm', () => {
      const result = computeMonthlyTarget({
        ...base,
        totalSeconds: h(10),
        workedTodaySeconds: h(10),
      });
      expect(result.overflowHours).toBe('02:00');
    });
  });
});
