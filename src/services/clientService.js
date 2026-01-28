import cliModel from '../models/client.js';
import projectModel from '../models/project.js';
import taskService from './taskService.js';
import clientRateHistory from '../models/clientRateHistory.js';
import {retriveYYYYMMDD} from '../utils.js';

const clientService = {
  create: name => {
    if (!name || name.trim().length === 0)
      throw new Error('Client name cannot be empty');
    if (name.length > 50)
      throw new Error('Client name cannot exceed 50 characters');

    return cliModel.create(name);
  },
  selectAll: () => {
    return cliModel.listAll();
  },

  delete: async client => {
    const projects = await projectModel.selectByCliId(client.id);

    for (const project of projects) {
      await taskService.deleteByProject(project.id);
      await projectModel.delete(project.id);
    }

    return cliModel.delete(client.id);
  },

  update: (id, name) => {
    if (!name || name.trim().length === 0)
      throw new Error('Client name cannot be empty');
    if (name.length > 50)
      throw new Error('Client name cannot exceed 50 characters');

    return cliModel.edit(id, name);
  },

  updatePricing: async (
    id,
    {hourlyRate, currency = 'PLN', effectiveFrom = null},
  ) => {
    if (hourlyRate === null || hourlyRate === undefined)
      throw new Error('Hourly rate is required');
    if (isNaN(hourlyRate) || hourlyRate <= 0)
      throw new Error('Hourly rate must be a positive number');
    if (currency && currency.length !== 3)
      throw new Error('Currency must be a 3-letter code');

    const effectiveDate = effectiveFrom || retriveYYYYMMDD(new Date());

    // Create rate history entry
    await clientRateHistory.create({
      clientId: id,
      hourlyRate,
      currency,
      effectiveFrom: effectiveDate,
    });

    // Also update client table for quick access to current rate
    return cliModel.updatePricing(id, {hourlyRate, currency});
  },

  getCurrentRate: clientId => clientRateHistory.getCurrentRate(clientId),

  getRateHistory: clientId => clientRateHistory.getByClientId(clientId),

  selectById: id => cliModel.selectById(id),
};

export default clientService;
