import db from '../db/db.js';
const PROJECT_TABLE = 'project';

const project = {
  create: (name, client_id) => {
    return db(PROJECT_TABLE).insert({name, client_id});
  },

  selectProject: id => {
    return db(PROJECT_TABLE).select('name').where('id', id);
  },

  selectById: id => db(PROJECT_TABLE).select().where('id', id).first(),

  selectByCliId: cliId => {
    return db(PROJECT_TABLE).select().where('client_id', cliId);
  },

  listAll: () => {
    return db(PROJECT_TABLE).select();
  },

  delete: id => db(PROJECT_TABLE).where('id', id).del(),

  edit: (id, name) => {
    return db(PROJECT_TABLE).where({id}).update({name}, ['name']);
  },

  isProject: async () => {
    return db(PROJECT_TABLE)
      .select()
      .then(d => d.length > 0);
  },
};

export default project;
