import { API_CONFIG } from './config';
import { mockPatientService } from '../mock';
import { httpClient } from '../http';

const realPatientApi = {
  getAllPatients: () => 
    httpClient.get('/patients'),
  
  getPatientByNationalId: (nationalId) => 
    httpClient.get(`/patients/national-id/${nationalId}`),
  
  getPatientById: (id) => 
    httpClient.get(`/patients/${id}`),
  
  searchPatients: (query) => 
    httpClient.get(`/patients/search?q=${encodeURIComponent(query)}`),
  
  createPatient: (patientData) => 
    httpClient.post('/patients', patientData),
  
  updatePatient: (id, patientData) => 
    httpClient.put(`/patients/${id}`, patientData),
  
  getPatientVisits: (patientId) => 
    httpClient.get(`/patients/${patientId}/visits`),
  
  getPatientStats: () => 
    httpClient.get('/patients/stats'),
};

export const patientApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockPatientService : realPatientApi;
    return service[prop];
  }
});

