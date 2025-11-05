import TogglClient from './togglClient.js';
import taskModel from '../models/task.js';
import projectModel from '../models/project.js';

class SyncService {
  constructor(apiToken, workspaceId, projectMapping = {}) {
    this.togglClient = new TogglClient(apiToken, workspaceId);
    this.projectMapping = projectMapping;
  }

  async syncTasksByDate(date, projectId = null) {
    const tasks = await this._getTasksForDate(date, projectId);
    const results = [];

    for (const task of tasks) {
      try {
        const togglProjectId = this.projectMapping[task.project_id];
        const timeEntry = await this._createTimeEntry(task, togglProjectId);
        results.push({success: true, task, timeEntry});
      } catch (error) {
        results.push({success: false, task, error: error.message});
      }
    }

    return results;
  }

  async syncTasksByProject(projectId, date) {
    return this.syncTasksByDate(date, projectId);
  }

  async _getTasksForDate(date, projectId = null) {
    const dateStr = this._formatDate(date);
    let tasks = await taskModel.listAllByDate(dateStr);

    if (projectId) tasks = tasks.filter(task => task.project_id === projectId);

    return tasks.filter(task => task.end !== null);
  }

  async _createTimeEntry(task, togglProjectId = null) {
    const start = new Date(task.start).toISOString();
    const end = new Date(task.end).toISOString();
    const duration = Math.floor((new Date(task.end) - new Date(task.start)) / 1000);

    return this.togglClient.createTimeEntry({
      projectId: togglProjectId,
      description: task.title,
      start,
      stop: end,
      duration,
    });
  }

  _formatDate(date) {
    if (typeof date === 'string') return date;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  setProjectMapping(mapping) {
    this.projectMapping = mapping;
  }

  async getTogglProjects() {
    return this.togglClient.getProjects();
  }
}

export default SyncService;
