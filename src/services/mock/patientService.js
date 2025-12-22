import { mockPatients, mockVisits } from './mockData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let patients = [...mockPatients];

export const mockPatientService = {
  async getAllPatients() {
    await delay();
    return patients;
  },

  async getPatientByNationalId(nationalId) {
    await delay();
    const patient = patients.find(p => p.nationalId === nationalId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  },

  async getPatientById(id) {
    await delay();
    const patient = patients.find(p => p.id === id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  },

  async searchPatients(query) {
    await delay();
    const lowerQuery = query.toLowerCase();
    return patients.filter(p => 
      p.nationalId.includes(query) ||
      p.firstName.toLowerCase().includes(lowerQuery) ||
      p.lastName.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query)
    );
  },

  async createPatient(patientData) {
    await delay();
    const newPatient = {
      id: String(patients.length + 1),
      ...patientData,
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    return newPatient;
  },

  async updatePatient(id, patientData) {
    await delay();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }
    patients[index] = { ...patients[index], ...patientData };
    return patients[index];
  },

  async getPatientVisits(patientId) {
    await delay();
    return mockVisits.filter(v => v.patientId === patientId);
  },

  async getPatientStats() {
    await delay();
    return {
      total: patients.length,
      newToday: patients.filter(p => {
        const createdDate = new Date(p.createdAt);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString();
      }).length,
    };
  },
};

