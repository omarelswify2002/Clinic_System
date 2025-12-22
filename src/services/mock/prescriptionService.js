import { mockPrescriptions } from './mockData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let prescriptions = [...mockPrescriptions];

export const mockPrescriptionService = {
  async getAllPrescriptions() {
    await delay();
    return prescriptions.sort((a, b) => 
      new Date(b.prescriptionDate) - new Date(a.prescriptionDate)
    );
  },

  async getPrescriptionById(id) {
    await delay();
    const prescription = prescriptions.find(p => p.id === id);
    if (!prescription) {
      throw new Error('Prescription not found');
    }
    return prescription;
  },

  async getPatientPrescriptions(patientId) {
    await delay();
    return prescriptions
      .filter(p => p.patientId === patientId)
      .sort((a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate));
  },

  async getVisitPrescription(visitId) {
    await delay();
    return prescriptions.find(p => p.visitId === visitId);
  },

  async createPrescription(prescriptionData) {
    await delay();

    // Check if patient has existing prescriptions
    const patientPrescriptions = prescriptions.filter(
      p => p.patientId === prescriptionData.patientId
    );

    // If patient has prescriptions, check if the latest one is older than 24 hours
    if (patientPrescriptions.length > 0) {
      const latestPrescription = patientPrescriptions.sort(
        (a, b) => new Date(b.prescriptionDate) - new Date(a.prescriptionDate)
      )[0];

      const hoursSinceLastPrescription =
        (new Date() - new Date(latestPrescription.prescriptionDate)) / (1000 * 60 * 60);

      // If less than 24 hours, this is a continuation/update of the same prescription
      // If more than 24 hours, this is a new prescription (versioning)
      console.log(`Hours since last prescription: ${hoursSinceLastPrescription.toFixed(2)}`);
    }

    // Always create a new prescription (versioning)
    // Old prescriptions remain in history for patient review
    const newPrescription = {
      id: String(prescriptions.length + 1),
      ...prescriptionData,
      prescriptionDate: new Date().toISOString(),
      version: patientPrescriptions.length + 1, // Track prescription version
    };
    prescriptions.push(newPrescription);
    return newPrescription;
  },

  async updatePrescription(id, prescriptionData) {
    await delay();
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Prescription not found');
    }
    prescriptions[index] = { ...prescriptions[index], ...prescriptionData };
    return prescriptions[index];
  },
};

