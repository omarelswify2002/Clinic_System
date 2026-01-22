import { API_CONFIG } from './config';
import { mockQueueService } from '../mock';
import { httpClient } from '../http';
import { adaptQueue, adaptQueueToBackend } from './adapters';

const realQueueApi = {
  getQueue: async () => {
    const queues = await httpClient.get('/queues');
    return queues.map(adaptQueue);
  },

  getTodayQueue: async () => {
    // Backend doesn't have this endpoint, get all and filter
    const queues = await httpClient.get('/queues');
    const today = new Date().toDateString();
    const filtered = queues.filter(q =>
      new Date(q.queuedAt).toDateString() === today
    );
    return filtered.map(adaptQueue);
  },

  addToQueue: async (patientId, patient, notes, priority) => {
    // Backend expects: { patientId, reason, priority }
    // Backend automatically manages position and status
    const queueData = {
      patientId: parseInt(patientId),
      reason: notes || '',
      priority: priority || 'normal',
    };

    console.log('Adding to queue:', queueData);

    // Backend returns: { message, queue, visit, prescription }
    const response = await httpClient.post('/queues', queueData);

    // Extract the queue entry from the response
    const queueEntry = response.queue || response;
    return adaptQueue(queueEntry);
  },

  updateQueueStatus: async (queueId, status) => {
    // Backend has specific endpoints for start and complete
    if (status === 'in_progress') {
      const queue = await httpClient.patch(`/queues/${queueId}/start`);
      return adaptQueue(queue);
    } else if (status === 'completed') {
      const queue = await httpClient.patch(`/queues/${queueId}/complete`);
      return adaptQueue(queue);
    } else {
      // For other statuses, we might need a generic update endpoint
      throw new Error('Unsupported status update');
    }
  },

  removeFromQueue: async (queueId) => {
    await httpClient.delete(`/queues/${queueId}`);
    return { success: true };
  },

  getQueueStats: async () => {
    // Backend now has a stats endpoint
    const stats = await httpClient.get('/queues/stats');
    return stats;
  },
};

export const queueApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockQueueService : realQueueApi;
    return service[prop];
  }
});

