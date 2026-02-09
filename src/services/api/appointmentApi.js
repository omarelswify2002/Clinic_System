import { API_CONFIG } from './config';
import { httpClient } from '../http';
import { mockAppointmentService } from '../mock';

const realAppointmentApi = {
  getAppointments: async (date) => {
    if (date) {
      return await httpClient.get(`/appointments?date=${encodeURIComponent(date)}`);
    }
    return await httpClient.get('/appointments');
  },

  getAppointmentById: async (id) => {
    return await httpClient.get(`/appointments/${id}`);
  },

  createAppointment: async (payload) => {
    return await httpClient.post('/appointments', payload);
  },

  updateAppointment: async (id, payload) => {
    return await httpClient.patch(`/appointments/${id}`, payload);
  },

  cancelAppointment: async (id) => {
    return await httpClient.patch(`/appointments/${id}/cancel`);
  },

  checkInAppointment: async (id) => {
    return await httpClient.patch(`/appointments/${id}/check-in`);
  },
};

export const appointmentApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockAppointmentService : realAppointmentApi;
    return service[prop];
  },
});
