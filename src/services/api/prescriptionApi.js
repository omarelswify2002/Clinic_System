import { API_CONFIG } from './config';
import { mockPrescriptionService } from '../mock';
import { httpClient } from '../http';

const realPrescriptionApi = {
  getAllPrescriptions: () => 
    httpClient.get('/prescriptions'),
  
  getPrescriptionById: (id) => 
    httpClient.get(`/prescriptions/${id}`),
  
  getPatientPrescriptions: (patientId) => 
    httpClient.get(`/prescriptions/patient/${patientId}`),
  
  getVisitPrescription: (visitId) => 
    httpClient.get(`/prescriptions/visit/${visitId}`),
  
  createPrescription: (prescriptionData) => 
    httpClient.post('/prescriptions', prescriptionData),
  
  updatePrescription: (id, prescriptionData) => 
    httpClient.put(`/prescriptions/${id}`, prescriptionData),
};

export const prescriptionApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockPrescriptionService : realPrescriptionApi;
    return service[prop];
  }
});

