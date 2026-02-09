import { API_CONFIG } from './config';
import { httpClient } from '../http';
import { mockClinicHoursService } from '../mock';

const realClinicHoursApi = {
  getClinicHours: async () => {
    return await httpClient.get('/clinic-hours');
  },

  updateClinicHours: async (dayOfWeek, payload) => {
    return await httpClient.put(`/clinic-hours/${dayOfWeek}`, payload);
  },
};

export const clinicHoursApi = new Proxy({}, {
  get: (_target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockClinicHoursService : realClinicHoursApi;
    return service[prop];
  },
});
