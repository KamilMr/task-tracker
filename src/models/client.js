import db from '../db/db.js';
const PROJECT_TABLE = 'client';

const client = {
  create: data => {
    return db(PROJECT_TABLE).insert({name: data});
  },

  listAll: () => {
    return db(PROJECT_TABLE).select();
  },

  delete: name => {
    return db(PROJECT_TABLE).where('name', name).del(['id', 'name']);
  },

  edit: (id, name) => {
    return db(PROJECT_TABLE).where({id}).update({name}, ['name']);
  },

  isClient: async () => {
    return db(PROJECT_TABLE)
      .select()
      .then(d => d.length > 0);
  },

  selectById: id => db(PROJECT_TABLE).select().where('id', id).first(),

  updatePricing: (id, {hourlyRate, currency}) => {
    const updates = {};
    if (hourlyRate !== undefined) updates.hourly_rate = hourlyRate;
    if (currency !== undefined) updates.currency = currency;
    if (Object.keys(updates).length === 0) return Promise.resolve(0);
    return db(PROJECT_TABLE).where({id}).update(updates);
  },
};

export default client;
