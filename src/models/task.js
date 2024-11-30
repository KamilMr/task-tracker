import db from '../db/db.js';
const PROJECT_TABLE = 'task';

const task = {
  listAll: () => {
    return db(PROJECT_TABLE).select();
  },

  create: ({start, end, title, projectId}) => {
    return db(PROJECT_TABLE).insert({
      title,
      end,
      start,
      project_id: projectId,
    });
  },

  selectById: id => {
    return db(PROJECT_TABLE).select().where('id', id);
  },

  edit: ({id, start, end, title,time, projectId}) => {
    return db(PROJECT_TABLE).where({id}).update({
      title,
      end,
      start,
      time,
      project_id: projectId,
    });
  },

  delete: ({col, val}) => {
    return db(PROJECT_TABLE).where(col, val).del();
  },
};

export default task;
