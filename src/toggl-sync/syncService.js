import TogglClient from './togglClient.js';
import timeEntryModel from '../models/timeEntry.js';
import projectModel from '../models/project.js';

class SyncService {
  constructor(apiToken, workspaceId, projectMapping = {}) {
    this.togglClient = new TogglClient(apiToken, workspaceId);
    this.projectMapping = projectMapping;
  }

  async syncTasksByDate(date, projectId = null, clientId = null) {
    const entries = await this._getEntriesForDate(date, projectId, clientId);
    const results = [];

    for (const entry of entries) {
      try {
        const togglProjectId = this.projectMapping[entry.project_id];
        const timeEntry = await this._createTimeEntry(entry, togglProjectId);
        results.push({success: true, task: entry, timeEntry});
      } catch (error) {
        results.push({success: false, task: entry, error: error.message});
      }
    }

    return results;
  }

  async syncTasksByProject(projectId, date) {
    return this.syncTasksByDate(date, projectId);
  }

  async _getEntriesForDate(date, projectId = null, clientId = null) {
    const dateStr = this._formatDate(date);
    let entries = await timeEntryModel.selectByDateWithTask(dateStr);

    if (projectId)
      entries = entries.filter(entry => entry.project_id === projectId);

    if (clientId) {
      const clientProjects = await projectModel.selectByCliId(clientId);
      const clientProjectIds = clientProjects.map(p => p.id);
      entries = entries.filter(entry =>
        clientProjectIds.includes(entry.project_id),
      );
    }

    return entries.filter(entry => entry.end !== null);
  }

  async _createTimeEntry(entry, togglProjectId = null) {
    const start = new Date(entry.start).toISOString();
    const end = new Date(entry.end).toISOString();
    const duration = Math.floor(
      (new Date(entry.end) - new Date(entry.start)) / 1000,
    );

    return this.togglClient.createTimeEntry({
      projectId: togglProjectId,
      description: entry.title,
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
