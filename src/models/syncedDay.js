import db from '../db/db.js';
const SYNCED_DAY_TABLE = 'synced_day';

const syncedDay = {
  getSyncStatus: day => {
    return db(SYNCED_DAY_TABLE).select().where('day', day).first();
  },

  markAsSynced: day => {
    return db(SYNCED_DAY_TABLE)
      .insert({
        day,
        synced: true,
        synced_at: db.fn.now(),
      })
      .onConflict('day')
      .merge({
        synced: true,
        synced_at: db.fn.now(),
      });
  },

  isSynced: async day => {
    const record = await db(SYNCED_DAY_TABLE)
      .select('synced')
      .where('day', day)
      .first();
    return record?.synced || false;
  },
};

export default syncedDay;
