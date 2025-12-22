import { mockVisits } from './mockData';
import { VISIT_STATUS } from '../../shared/constants';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

let visits = [...mockVisits];

export const mockVisitService = {
  async getAllVisits() {
    await delay();
    return visits.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  },

  async getVisitById(id) {
    await delay();
    const visit = visits.find(v => v.id === id);
    if (!visit) {
      throw new Error('Visit not found');
    }
    return visit;
  },

  async getPatientVisits(patientId) {
    await delay();
    return visits
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  },

  async createVisit(visitData) {
    await delay();
    const newVisit = {
      id: String(visits.length + 1),
      ...visitData,
      visitDate: new Date().toISOString(),
      status: VISIT_STATUS.IN_PROGRESS,
    };
    visits.push(newVisit);
    return newVisit;
  },

  async updateVisit(id, visitData) {
    await delay();
    const index = visits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Visit not found');
    }
    visits[index] = { ...visits[index], ...visitData };
    return visits[index];
  },

  async completeVisit(id) {
    await delay();
    const index = visits.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Visit not found');
    }
    visits[index] = { 
      ...visits[index], 
      status: VISIT_STATUS.COMPLETED,
      completedAt: new Date().toISOString(),
    };
    return visits[index];
  },

  async getTodayVisits() {
    await delay();
    const today = new Date().toDateString();
    return visits.filter(v => {
      const visitDate = new Date(v.visitDate).toDateString();
      return visitDate === today;
    }).sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
  },
};

