import { API_CONFIG } from './config';
import { mockQueueService } from '../mock';
import { httpClient } from '../http';

const realQueueApi = {
  getQueue: () => 
    httpClient.get('/queue'),
  
  getTodayQueue: () => 
    httpClient.get('/queue/today'),
  
  addToQueue: (patientId, patient, notes, priority) => 
    httpClient.post('/queue', { patientId, patient, notes, priority }),
  
  updateQueueStatus: (queueId, status) => 
    httpClient.patch(`/queue/${queueId}`, { status }),
  
  removeFromQueue: (queueId) => 
    httpClient.delete(`/queue/${queueId}`),
  
  getQueueStats: () => 
    httpClient.get('/queue/stats'),
};

export const queueApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockQueueService : realQueueApi;
    return service[prop];
  }
});

