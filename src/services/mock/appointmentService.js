const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

let appointments = [];
let nextId = 1;

const getDayRange = (dateStr) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

export const mockAppointmentService = {
  async getAppointments(date) {
    await delay();
    if (!date) return appointments;
    const range = getDayRange(date);
    if (!range) return [];
    return appointments.filter(a => {
      const scheduled = new Date(a.scheduledAt);
      return scheduled >= range.start && scheduled < range.end;
    });
  },

  async getAppointmentById(id) {
    await delay();
    return appointments.find(a => a.id === Number(id));
  },

  async createAppointment(payload) {
    await delay();
    const appointment = {
      id: nextId++,
      status: 'booked',
      durationMinutes: payload.durationMinutes || 20,
      ...payload,
    };
    appointments.push(appointment);
    return appointment;
  },

  async updateAppointment(id, payload) {
    await delay();
    const index = appointments.findIndex(a => a.id === Number(id));
    if (index === -1) throw new Error('Appointment not found');
    appointments[index] = { ...appointments[index], ...payload };
    return appointments[index];
  },

  async cancelAppointment(id) {
    await delay();
    return this.updateAppointment(id, { status: 'cancelled' });
  },

  async checkInAppointment(id) {
    await delay();
    return this.updateAppointment(id, { status: 'checked_in' });
  },
};
