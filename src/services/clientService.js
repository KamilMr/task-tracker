import cliModel from '../models/client.js';
import projectModel from '../models/project.js';
import task from '../models/task.js';
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

    // remove tasks
    for (const project of projects) {
      await task.delete({col: 'project_id', val: project.id});
      // remove projectes
      await projectModel.delete({col: 'id', value: project.id});
    }

    return cliModel.delete(client.name);
  },

  update: (id, name) => {
    if (!name || name.trim().length === 0)
      throw new Error('Client name cannot be empty');
    if (name.length > 50)
      throw new Error('Client name cannot exceed 50 characters');

    return cliModel.edit(id, name);
  },

  updatePricing: async (id, {hourlyRate, currency = 'PLN', effectiveFrom = null}) => {
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
