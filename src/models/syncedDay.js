import db from '../db/db.js';
const SYNCED_DAY_TABLE = 'synced_day';

const syncedDay = {
  getSyncStatus: (day, clientId) => {
    return db(SYNCED_DAY_TABLE)
      .select()
      .where('day', day)
      .andWhere('client_id', clientId)
      .first();
  },

  markAsSynced: (day, clientId) => {
    return db(SYNCED_DAY_TABLE)
      .insert({
        day,
        client_id: clientId,
        synced: true,
        synced_at: db.fn.now(),
      })
      .onConflict(['day', 'client_id'])
      .merge({
        synced: true,
        synced_at: db.fn.now(),
      });
  },

  isSynced: async (day, clientId) => {
    const record = await db(SYNCED_DAY_TABLE)
      .select('synced')
      .where('day', day)
      .andWhere('client_id', clientId)
      .first();
    return record?.synced || false;
  },
};

export default syncedDay;
