import { API_CONFIG } from './config';
import { mockVisitService } from '../mock';
import { httpClient } from '../http';

const realVisitApi = {
  getAllVisits: () => 
    httpClient.get('/visits'),
  
  getVisitById: (id) => 
    httpClient.get(`/visits/${id}`),
  
  getPatientVisits: (patientId) => 
    httpClient.get(`/visits/patient/${patientId}`),
  
  createVisit: (visitData) => 
    httpClient.post('/visits', visitData),
  
  updateVisit: (id, visitData) => 
    httpClient.put(`/visits/${id}`, visitData),
  
  completeVisit: (id) => 
    httpClient.patch(`/visits/${id}/complete`),
  
  getTodayVisits: () => 
    httpClient.get('/visits/today'),
};

export const visitApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockVisitService : realVisitApi;
    return service[prop];
  }
});

