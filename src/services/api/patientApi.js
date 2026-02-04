import { API_CONFIG } from './config';
import { mockPatientService } from '../mock';
import { httpClient } from '../http';
import { adaptPatient, adaptPatientToBackend, adaptVisit } from './adapters';

const realPatientApi = {
  /**
   * getAllPatients supports two call styles:
   * - legacy: getAllPatients() -> returns Array<patient>
   * - paginated: getAllPatients(page, limit) -> returns { data: [...], pagination }
   */
  getAllPatients: async (page, limit) => {
    // Legacy full-list when called with no args
    if (typeof page === 'undefined' && typeof limit === 'undefined') {
      const response = await httpClient.get(`/patients?page=1&limit=999999`);
      const list = response?.data || response || [];
      return list.map(adaptPatient);
    }

    // normalize defaults for paginated call
    page = typeof page === 'undefined' ? 1 : page;
    limit = typeof limit === 'undefined' ? 10 : limit;

    const response = await httpClient.get(`/patients?page=${page}&limit=${limit}`);
    return {
      data: (response.data || []).map(adaptPatient),
      pagination: response.pagination || { page, limit, total: (response.pagination && response.pagination.total) || (response.data || []).length }
    };
  },

  getPatientByNationalId: async (nationalId) => {
    // Backend doesn't have this endpoint, search by nationalID in all patients
    // Get all patients without pagination
    const response = await httpClient.get('/patients?limit=999999');
    const patients = response.data || response;
    const patient = patients.find(p => p.nationalID === nationalId);
    return patient ? adaptPatient(patient) : null;
  },

  getPatientById: async (id) => {
    const resp = await httpClient.get(`/patients/${id}`);
    const patient = resp?.data || resp;
    return adaptPatient(patient);
  },

  searchPatients: async (query) => {
    // Backend doesn't have search endpoint, get all and filter
    // Get all patients without pagination
    const response = await httpClient.get('/patients?limit=999999');
    const patients = response.data || response;
    const cleanQuery = (query || '').toLowerCase(); // normalize query for case-insensitive search
    const filtered = patients.filter(p =>
      p.nationalID?.toLowerCase().includes(cleanQuery) ||
      p.nationalId?.toLowerCase().includes(cleanQuery) ||
      p.name?.toLowerCase()?.includes(cleanQuery) ||
      p.firstName?.toLowerCase()?.includes(cleanQuery) ||
      p.lastName?.toLowerCase()?.includes(cleanQuery) ||
      p.phone?.includes(query)
    );
    return filtered.map(adaptPatient);
    
  },

  createPatient: async (patientData) => {
    const backendData = adaptPatientToBackend(patientData);
    const resp = await httpClient.post('/patients', backendData);
    const patient = resp?.data || resp;
    return adaptPatient(patient);
  },

  updatePatient: async (id, patientData) => {
    const backendData = adaptPatientToBackend(patientData);
    const resp = await httpClient.put(`/patients/${id}`, backendData);
    const patient = resp?.data || resp;
    return adaptPatient(patient);
  },

  getPatientVisits: async (patientIdentifier) => {
    // Accept either numeric patient ID or nationalId; if nationalId provided, resolve to numeric id first
    let patientId = patientIdentifier;
    if (isNaN(Number(patientIdentifier))) {
      const patient = await realPatientApi.getPatientByNationalId(patientIdentifier);
      if (!patient) return [];
      patientId = patient.id;
    }

    // Backend doesn't have this endpoint, get all and filter
    // Get all visits without pagination
    const response = await httpClient.get('/visits?limit=999999');
    const visits = response.data || response;
    const filtered = visits.filter(v => String(v.patientId) === String(patientId));
    return filtered.map(adaptVisit);
  },

  getPatientStats: async () => {
    // Backend doesn't have this endpoint, get all and compute stats
     // Get all patients without pagination
    const response = await httpClient.get('/patients?limit=999999');
    const patients = response.data || response;
    const today = new Date().toDateString();
    const newToday = patients.filter(p => new Date(p.createdAt).toDateString() === today).length;
    return {
      total: patients.length,
      newToday,
    };
    
  },
};

export const patientApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockPatientService : realPatientApi;
    return service[prop];
  }
});

