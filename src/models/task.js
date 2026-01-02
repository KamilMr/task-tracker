import db from '../db/db.js';
const TABLE = 'task';

const task = {
  listAll: () => db(TABLE).select(),

  listAllWithProject: () =>
    db(TABLE)
      .join('project', 'task.project_id', 'project.id')
      .select('task.*', 'project.name as project_name'),

  create: ({title, projectId, estimatedHours = null}) =>
    db(TABLE).insert({
      title,
      project_id: projectId,
      estimated_hours: estimatedHours,
    }),

  selectById: id => db(TABLE).select().where('id', id).first(),

  selectByProjectId: projectId =>
    db(TABLE).select().where('project_id', projectId).orderBy('title', 'asc'),

  findByTitleAndProject: (title, projectId) =>
    db(TABLE)
      .select()
      .where('title', title)
      .andWhere('project_id', projectId)
      .first(),

  getOrCreate: async ({title, projectId}) => {
    const existing = await task.findByTitleAndProject(title, projectId);
    if (existing) return existing;

    const [id] = await task.create({title, projectId});
    return task.selectById(id);
  },

  getDistinctTaskNamesByProject: projectId =>
    db(TABLE)
      .distinct('title')
      .where('project_id', projectId)
      .orderBy('title', 'asc'),

  update: ({id, title, estimatedHours}) => {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (estimatedHours !== undefined) updates.estimated_hours = estimatedHours;
    return db(TABLE).where({id}).update(updates);
  },

  delete: id => db(TABLE).where('id', id).del(),

  deleteByProjectId: projectId => db(TABLE).where('project_id', projectId).del(),
};

export default task;
