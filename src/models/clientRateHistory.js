import db from '../db/db.js';

const TABLE = 'client_rate_history';

const clientRateHistory = {
  create: ({clientId, hourlyRate, currency = 'PLN', effectiveFrom}) =>
    db(TABLE).insert({
      client_id: clientId,
      hourly_rate: hourlyRate,
      currency,
      effective_from: effectiveFrom,
    }),

  // Get rate effective for a specific date
  getRateForDate: (clientId, date) =>
    db(TABLE)
      .select()
      .where('client_id', clientId)
      .where('effective_from', '<=', date)
      .orderBy('effective_from', 'desc')
      .first(),

  // Get current (latest) rate
  getCurrentRate: clientId =>
    db(TABLE)
      .select()
      .where('client_id', clientId)
      .orderBy('effective_from', 'desc')
      .first(),

  // Get all rates for a client
  getByClientId: clientId =>
    db(TABLE)
      .select()
      .where('client_id', clientId)
      .orderBy('effective_from', 'desc'),

  // Get all rate periods that overlap with a date range
  getRatesInRange: (clientId, startDate, endDate) =>
    db(TABLE)
      .select()
      .where('client_id', clientId)
      .where('effective_from', '<=', endDate)
      .orderBy('effective_from', 'asc'),
};

export default clientRateHistory;
