import db from '../db/db.js';
const TABLE = 'time_entry';

const timeEntry = {
  create: ({taskId, start, end = null}) =>
    db(TABLE).insert({task_id: taskId, start, end}),

  selectById: id => db(TABLE).select().where('id', id).first(),

  selectByTaskId: taskId => db(TABLE).select().where('task_id', taskId),

  selectActiveEntry: () => db(TABLE).select().whereNull('end').first(),

  selectByDate: date =>
    db(TABLE)
      .select()
      .where('start', '>=', date)
      .andWhere('start', '<', `${date} 23:59:59`),

  selectByDateWithTask: date =>
    db(TABLE)
      .join('task', 'time_entry.task_id', 'task.id')
      .select(
        'time_entry.id',
        'time_entry.task_id',
        'time_entry.start',
        'time_entry.end',
        'task.title',
        'task.project_id',
        'task.estimated_hours',
      )
      .where('time_entry.start', '>=', date)
      .andWhere('time_entry.start', '<', `${date} 23:59:59`),

  update: ({id, start, end}) => {
    const updates = {};
    if (start !== undefined) updates.start = start;
    if (end !== undefined) updates.end = end;
    return db(TABLE).where({id}).update(updates);
  },

  delete: id => db(TABLE).where('id', id).del(),

  deleteByTaskId: taskId => db(TABLE).where('task_id', taskId).del(),

  getTodayEntriesByProject: (date, projectId = null) => {
    let query = db(TABLE)
      .join('task', 'time_entry.task_id', 'task.id')
      .select('time_entry.start', 'time_entry.end')
      .where(db.raw('DATE(time_entry.start)'), date)
      .whereNotNull('time_entry.end');

    if (projectId) query = query.where('task.project_id', projectId);
    return query;
  },

  listAll: () => db(TABLE).select(),
};

export default timeEntry;
