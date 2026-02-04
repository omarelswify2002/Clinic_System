import { API_CONFIG } from './config';
import { mockVisitService } from '../mock';
import { httpClient } from '../http';
import { adaptVisit, adaptVisitToBackend } from './adapters';

const realVisitApi = {
  /**
   * getAllVisits supports two call styles:
   * - legacy: getAllVisits() -> returns Array<visit>
   * - paginated: getAllVisits(page, limit) -> returns { data: [...], pagination }
   */
  getAllVisits: async (page, limit) => {
    // legacy full-list when called with no args
    if (typeof page === 'undefined' && typeof limit === 'undefined') {
      const resp = await httpClient.get(`/visits?page=1&limit=999999`);
      const list = resp?.data || resp || [];
      return list.map(adaptVisit);
    }

    // normalize defaults for paginated call
    page = typeof page === 'undefined' ? 1 : page;
    limit = typeof limit === 'undefined' ? 10 : limit;

    const resp = await httpClient.get(`/visits?page=${page}&limit=${limit}`);
    return {
      data: (resp.data || []).map(adaptVisit),
      pagination: resp.pagination || { page, limit, total: (resp.pagination && resp.pagination.total) || (resp.data || []).length }
    };
  },

  getVisitById: async (id) => {
    const resp = await httpClient.get(`/visits/${id}`);
    const visit = resp?.data || resp;
    return adaptVisit(visit);
  },

  getPatientVisits: async (patientId) => {
    // Backend doesn't have this endpoint, get all and filter
    // Get all visits without pagination
    const response = await httpClient.get('/visits?limit=999999');
    const visits = response.data || response;
    const filtered = visits.filter(v => String(v.patientId) === String(patientId));
    return filtered.map(adaptVisit);
  },

  createVisit: async (visitData) => {
    const backendData = adaptVisitToBackend(visitData);
    const resp = await httpClient.post('/visits', backendData);
    const visit = resp?.data || resp;
    return adaptVisit(visit);
  },

  updateVisit: async (id, visitData) => {
    const backendData = adaptVisitToBackend(visitData);
    const resp = await httpClient.put(`/visits/${id}`, backendData);
    const visit = resp?.data || resp;
    return adaptVisit(visit);
  },

  completeVisit: async (id) => {
    const resp = await httpClient.patch(`/visits/${id}/complete`);
    const visit = resp?.data || resp;
    return adaptVisit(visit);
  },

  getTodayVisits: async () => {
    // Backend doesn't have this endpoint, get all and filter
    // Get all visits without pagination
    const response = await httpClient.get('/visits?limit=999999');
    const visits = response.data || response;
    const today = new Date().toDateString(); // Get today's date in YYYY-MM-DD format
    const filtered = visits.filter(v => new Date(v.visitDate).toDateString() === today); // Filter visits by today's date
    return filtered.map(adaptVisit); // Return filtered visits as an array of adapted visits  
  },
};

export const visitApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockVisitService : realVisitApi;
    return service[prop];
  }
});

