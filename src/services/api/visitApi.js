import { API_CONFIG } from './config';
import { mockVisitService } from '../mock';
import { httpClient } from '../http';
import { adaptVisit, adaptVisitToBackend } from './adapters';

const realVisitApi = {
  getAllVisits: async () => {
    const visits = await httpClient.get('/visits');
    return visits.map(adaptVisit);
  },

  getVisitById: async (id) => {
    const visit = await httpClient.get(`/visits/${id}`);
    return adaptVisit(visit);
  },

  getPatientVisits: async (patientId) => {
    // Backend doesn't have this endpoint, get all and filter
    const visits = await httpClient.get('/visits');
    const filtered = visits.filter(v => String(v.patientId) === String(patientId));
    return filtered.map(adaptVisit);
  },

  createVisit: async (visitData) => {
    const backendData = adaptVisitToBackend(visitData);
    const visit = await httpClient.post('/visits', backendData);
    return adaptVisit(visit);
  },

  updateVisit: async (id, visitData) => {
    const backendData = adaptVisitToBackend(visitData);
    const visit = await httpClient.put(`/visits/${id}`, backendData);
    return adaptVisit(visit);
  },

  completeVisit: async (id) => {
    const visit = await httpClient.patch(`/visits/${id}/complete`);
    return adaptVisit(visit);
  },

  getTodayVisits: async () => {
    // Backend doesn't have this endpoint, get all and filter
    const visits = await httpClient.get('/visits');
    const today = new Date().toDateString();
    const filtered = visits.filter(v =>
      new Date(v.visitDate).toDateString() === today
    );
    return filtered.map(adaptVisit);
  },
};

export const visitApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockVisitService : realVisitApi;
    return service[prop];
  }
});

