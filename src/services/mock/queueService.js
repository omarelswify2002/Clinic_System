import { mockQueue } from './mockData';
import { QUEUE_STATUS } from '../../shared/constants';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let queue = [...mockQueue];

export const mockQueueService = {
  async getQueue() {
    await delay();
    return queue.sort((a, b) => a.queueNumber - b.queueNumber);
  },

  async getTodayQueue() {
    await delay();
    const today = new Date().toDateString();
    return queue.filter(q => {
      const arrivalDate = new Date(q.arrivalTime).toDateString();
      return arrivalDate === today;
    }).sort((a, b) => a.queueNumber - b.queueNumber);
  },

  async addToQueue(patientId, patient, notes = '', priority = 'normal') {
    await delay();
    const maxQueueNumber = queue.reduce((max, q) => Math.max(max, q.queueNumber), 0);
    const newQueueItem = {
      id: String(queue.length + 1),
      patientId,
      patient,
      queueNumber: maxQueueNumber + 1,
      status: QUEUE_STATUS.WAITING,
      priority,
      arrivalTime: new Date().toISOString(),
      notes,
    };
    queue.push(newQueueItem);
    return newQueueItem;
  },

  async updateQueueStatus(queueId, status) {
    await delay();
    const index = queue.findIndex(q => q.id === queueId);
    if (index === -1) {
      throw new Error('Queue item not found');
    }
    queue[index] = { ...queue[index], status };
    return queue[index];
  },

  async removeFromQueue(queueId) {
    await delay();
    const index = queue.findIndex(q => q.id === queueId);
    if (index === -1) {
      throw new Error('Queue item not found');
    }
    queue.splice(index, 1);
    return { success: true };
  },

  async getQueueStats() {
    await delay();
    const today = new Date().toDateString();
    const todayQueue = queue.filter(q => {
      const arrivalDate = new Date(q.arrivalTime).toDateString();
      return arrivalDate === today;
    });

    return {
      total: todayQueue.length,
      waiting: todayQueue.filter(q => q.status === QUEUE_STATUS.WAITING).length,
      inProgress: todayQueue.filter(q => q.status === QUEUE_STATUS.IN_PROGRESS).length,
      completed: todayQueue.filter(q => q.status === QUEUE_STATUS.COMPLETED).length,
    };
  },
};

