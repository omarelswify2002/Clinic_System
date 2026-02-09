const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

let clinicHours = [
  { id: 1, dayOfWeek: 0, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 2, dayOfWeek: 1, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 3, dayOfWeek: 2, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 4, dayOfWeek: 3, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 5, dayOfWeek: 4, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 6, dayOfWeek: 5, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
  { id: 7, dayOfWeek: 6, openTime: '09:00', closeTime: '17:00', slotMinutes: 20, isClosed: false },
];

export const mockClinicHoursService = {
  async getClinicHours() {
    await delay();
    return clinicHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },

  async updateClinicHours(dayOfWeek, payload) {
    await delay();
    const day = Number(dayOfWeek);
    const index = clinicHours.findIndex(h => h.dayOfWeek === day);
    if (index === -1) {
      const newEntry = { id: clinicHours.length + 1, dayOfWeek: day, ...payload };
      clinicHours.push(newEntry);
      return newEntry;
    }
    clinicHours[index] = { ...clinicHours[index], ...payload };
    return clinicHours[index];
  },
};
