import { API_CONFIG } from './config';
import { mockPatientService } from '../mock';
import { httpClient } from '../http';
import { adaptPatient, adaptPatientToBackend } from './adapters';

const realPatientApi = {
  getAllPatients: async () => {
    const patients = await httpClient.get('/patients');
    return patients.map(adaptPatient);
  },

  getPatientByNationalId: async (nationalId) => {
    // Backend doesn't have this endpoint, search by nationalID in all patients
    const patients = await httpClient.get('/patients');
    const patient = patients.find(p => p.nationalID === nationalId);
    return patient ? adaptPatient(patient) : null;
  },

  getPatientById: async (id) => {
    const patient = await httpClient.get(`/patients/${id}`);
    return adaptPatient(patient);
  },

  searchPatients: async (query) => {
    // Backend doesn't have search endpoint, get all and filter
    const patients = await httpClient.get('/patients');
    const filtered = patients.filter(p =>
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.phone?.includes(query) ||
      p.nationalID?.includes(query)
    );
    return filtered.map(adaptPatient);
  },

  createPatient: async (patientData) => {
    const backendData = adaptPatientToBackend(patientData);
    const patient = await httpClient.post('/patients', backendData);
    return adaptPatient(patient);
  },

  updatePatient: async (id, patientData) => {
    const backendData = adaptPatientToBackend(patientData);
    const patient = await httpClient.put(`/patients/${id}`, backendData);
    return adaptPatient(patient);
  },

  getPatientVisits: async (patientId) => {
    // This will be handled by visitApi
    return [];
  },

  getPatientStats: async () => {
    // Backend doesn't have stats endpoint, calculate from patients
    const patients = await httpClient.get('/patients');
    const today = new Date().toDateString();
    const newToday = patients.filter(p =>
      new Date(p.createdAt).toDateString() === today
    ).length;

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

