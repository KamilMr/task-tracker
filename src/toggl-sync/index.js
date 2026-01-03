import SyncService from './syncService.js';

const createTogglSync = (apiToken, workspaceId, projectMapping = {}) =>
  new SyncService(apiToken, workspaceId, projectMapping);

export {createTogglSync, SyncService};
export default createTogglSync;
