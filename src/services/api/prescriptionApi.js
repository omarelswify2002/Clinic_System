import { API_CONFIG } from './config';
import { mockPrescriptionService } from '../mock';
import { httpClient } from '../http';
import { adaptPrescription, adaptPrescriptionToBackend } from './adapters';

const realPrescriptionApi = {
  getAllPrescriptions: async () => {
    const prescriptions = await httpClient.get('/prescriptions');
    return prescriptions.map(adaptPrescription);
  },

  getPrescriptionById: async (id) => {
    const prescription = await httpClient.get(`/prescriptions/${id}`);
    return adaptPrescription(prescription);
  },

  getPatientPrescriptions: async (patientId) => {
    // Use the new backend endpoint that filters by patient ID
    const prescriptions = await httpClient.get(`/prescriptions/patient/${patientId}`);
    return prescriptions.map(adaptPrescription);
  },

  getVisitPrescription: async (visitId) => {
    // Backend doesn't have this endpoint, get all and filter
    const prescriptions = await httpClient.get('/prescriptions');
    const filtered = prescriptions.filter(p => String(p.visitId) === String(visitId));
    return filtered.length > 0 ? adaptPrescription(filtered[0]) : null;
  },

  createPrescription: async (prescriptionData) => {
    const backendData = adaptPrescriptionToBackend(prescriptionData);
    const prescription = await httpClient.post('/prescriptions', backendData);
    return adaptPrescription(prescription);
  },

  updatePrescription: async (id, prescriptionData) => {
    const backendData = adaptPrescriptionToBackend(prescriptionData);
    const prescription = await httpClient.put(`/prescriptions/${id}`, backendData);
    return adaptPrescription(prescription);
  },
};

export const prescriptionApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockPrescriptionService : realPrescriptionApi;
    return service[prop];
  }
});

