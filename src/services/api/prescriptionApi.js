import { API_CONFIG } from './config';
import { mockPrescriptionService } from '../mock';
import { httpClient } from '../http';
import { adaptPrescription, adaptPrescriptionToBackend } from './adapters';

const realPrescriptionApi = {
  /** getAllPrescriptions supports legacy and paginated calls */
  getAllPrescriptions: async (page, limit) => {
    // legacy full-list when called with no args
    if (typeof page === 'undefined' && typeof limit === 'undefined') {
      const resp = await httpClient.get(`/prescriptions?page=1&limit=999999`);
      const list = resp?.data || resp || [];
      return list.map(adaptPrescription);
    }

    // normalize defaults for paginated call
    page = typeof page === 'undefined' ? 1 : page;
    limit = typeof limit === 'undefined' ? 10 : limit;

    const resp = await httpClient.get(`/prescriptions?page=${page}&limit=${limit}`);
    return {
      data: (resp.data || []).map(adaptPrescription),
      pagination: resp.pagination || { page, limit, total: (resp.pagination && resp.pagination.total) || (resp.data || []).length }
    };
  },

  getPrescriptionById: async (id) => {
    const resp = await httpClient.get(`/prescriptions/${id}`);
    const prescription = resp?.data || resp;
    return adaptPrescription(prescription);
  },

  getPatientPrescriptions: async (patientId) => {
    try {
      const resp = await httpClient.get(`/prescriptions/patient/${patientId}`);
      const list = resp?.data || resp || [];
      return list.map(adaptPrescription);
    } catch {
      const resp = await realPrescriptionApi.getAllPrescriptions(1, 999999);
      const list = resp.data || resp;
      const filtered = list.filter(p => String(p.patientId) === String(patientId));
      return filtered.map(adaptPrescription);
    }
  },

  getVisitPrescription: async (visitId) => {
    try {
      const resp = await httpClient.get(`/prescriptions/visit/${visitId}`);
      const presc = resp?.data || resp;
      return presc ? adaptPrescription(presc) : null;
    } catch {
      const resp = await realPrescriptionApi.getAllPrescriptions(1, 999999);
      const list = resp.data || resp;
      const found = list.find(p => String(p.visitId) === String(visitId));
      return found ? adaptPrescription(found) : null;
    }
  },

  createPrescription: async (prescriptionData) => {
    const backendData = adaptPrescriptionToBackend(prescriptionData);
    const resp = await httpClient.post('/prescriptions', backendData);
    const presc = resp?.data || resp;
    return adaptPrescription(presc);
  },

  updatePrescription: async (id, prescriptionData) => {
    const backendData = adaptPrescriptionToBackend(prescriptionData);
    const resp = await httpClient.put(`/prescriptions/${id}`, backendData);
    const presc = resp?.data || resp;
    return adaptPrescription(presc);
  },
};

export const prescriptionApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockPrescriptionService : realPrescriptionApi;
    return service[prop];
  }
});

