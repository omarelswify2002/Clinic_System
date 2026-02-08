import { API_CONFIG } from './config';
import { mockQueueService } from '../mock';
import { httpClient } from '../http';
import { adaptQueue, adaptQueueToBackend } from './adapters';

const computeQueueStats = (queueList) => {
  const total = queueList.length;
  const waiting = queueList.filter(q => q.status === 'waiting').length;
  const inProgress = queueList.filter(q => q.status === 'in_progress').length;
  const completed = queueList.filter(q => q.status === 'completed').length;
  const consultationTotal = queueList.filter(q => q.priority === 'consultation').length;
  const visitTotal = total - consultationTotal;
  const completedConsultations = queueList.filter(
    q => q.status === 'completed' && q.priority === 'consultation'
  ).length;
  const completedVisits = queueList.filter(
    q => q.status === 'completed' && q.priority !== 'consultation'
  ).length;

  return {
    total,
    waiting,
    inProgress,
    completed,
    consultationTotal,
    visitTotal,
    completedConsultations,
    completedVisits,
  };
};

const sortQueueForDisplay = (queueList) => {
  const priorityRank = (item) => (item.isUrgent || item.priority === 'urgent' ? 0 : 1);
  return [...queueList].sort((a, b) => {
    const rankDiff = priorityRank(a) - priorityRank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.queueNumber || 0) - (b.queueNumber || 0);
  });
};

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
    const adapted = filtered.map(adaptQueue);
    return sortQueueForDisplay(adapted);
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
    // Compute stats from today's queue to include consultation vs visit counts
    const todayQueue = await realQueueApi.getTodayQueue();
    return computeQueueStats(todayQueue);
  },
};

export const queueApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockQueueService : realQueueApi;
    return service[prop];
  }
});

