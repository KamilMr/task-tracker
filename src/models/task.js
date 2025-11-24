import db from '../db/db.js';
const PROJECT_TABLE = 'task';

const task = {
  listAll: () => {
    return db(PROJECT_TABLE).select();
  },

  listAllByDate: date => {
    return db(PROJECT_TABLE)
      .select()
      .where('start', '>=', date)
      .andWhere('end', '<', `${date} 23:59:59`);
  },

  create: ({start, end, title, projectId}) => {
    return db(PROJECT_TABLE).insert({
      title,
      end,
      start,
      project_id: projectId,
    });
  },

  selectActiveTask: () => {
    return db(PROJECT_TABLE).select().whereNull('end').first();
  },

  selectById: id => {
    return db(PROJECT_TABLE).select().where('id', id);
  },

  selectByProjectId: projectId => {
    return db(PROJECT_TABLE).select().where('project_id', projectId);
  },

  getDistinctTaskNamesByProject: projectId => {
    return db(PROJECT_TABLE)
      .distinct('title')
      .where('project_id', projectId)
      .orderBy('title', 'asc');
  },

  findByNameAndProject: (title, projectId) => {
    return db(PROJECT_TABLE)
      .select()
      .where('title', title)
      .andWhere('project_id', projectId)
      .first();
  },

  findAllByNameAndProject: (title, projectId) => {
    return db(PROJECT_TABLE)
      .select()
      .where('title', title)
      .andWhere('project_id', projectId);
  },

  deleteAllByTitle: (title, projectId) => {
    return db(PROJECT_TABLE)
      .where('title', title)
      .andWhere('project_id', projectId)
      .del();
  },

  deleteByTitleAndDate: (title, projectId, date) => {
    return db(PROJECT_TABLE)
      .where('title', title)
      .andWhere('project_id', projectId)
      .andWhere('start', '>=', date)
      .andWhere('start', '<', `${date} 23:59:59`)
      .del();
  },

  edit: ({id, start, end, title, time, projectId}) => {
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

  getTodayHours: (projectId = null) => {
    const today = new Date().toISOString().split('T')[0];
    let query = db(PROJECT_TABLE)
      .select('start', 'end')
      .where(db.raw('DATE(start)'), today)
      .whereNotNull('end');

    if (projectId) {
      query = query.where('project_id', projectId);
    }

    return query;
  },
};

export default task;
