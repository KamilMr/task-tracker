import db from '../db/db.js';
const CLIENT_TABLE = 'client';

const client = {
  create: data => db(CLIENT_TABLE).insert({name: data}),

  listAll: () => db(CLIENT_TABLE).select(),

  delete: id => db(CLIENT_TABLE).where('id', id).del(),

  edit: (id, name) => db(CLIENT_TABLE).where({id}).update({name}, ['name']),

  selectById: id => db(CLIENT_TABLE).select().where('id', id).first(),

  updatePricing: (id, {hourlyRate, currency}) => {
    const updates = {};
    if (hourlyRate !== undefined) updates.hourly_rate = hourlyRate;
    if (currency !== undefined) updates.currency = currency;
    if (Object.keys(updates).length === 0) return Promise.resolve(0);
    return db(CLIENT_TABLE).where({id}).update(updates);
  },
};

export default client;
