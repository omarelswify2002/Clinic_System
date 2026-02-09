import { useEffect, useMemo, useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Card, Button, Table, DatePicker, PermissionGuard } from '../../shared/ui';
import { appointmentApi, clinicHoursApi } from '../../services/api';
import AppointmentFormModal from './AppointmentFormModal';
import { useTranslation } from '../../shared/i18n';
import { PERMISSIONS, hasPermission } from '../../shared/utils';
import { useAuthStore } from '../../app/store';

const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const buildSlots = (openTime, closeTime, slotMinutes) => {
  if (!openTime || !closeTime || !slotMinutes) return [];
  const open = toMinutes(openTime);
  const close = toMinutes(closeTime);
  const slots = [];
  for (let t = open; t + slotMinutes <= close; t += slotMinutes) {
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
  }
  return slots;
};

const getDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getLocalTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const formatTime12h = (time) => {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${m === 0 ? '' : `:${String(m).padStart(2, '0')}`} ${period}`;
};

export default function AppointmentManagement() {
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [clinicHours, setClinicHours] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const canManage = hasPermission(user, PERMISSIONS.MANAGE_APPOINTMENTS);

  const loadData = async (dateStr) => {
    try {
      setLoading(true);
      const [hoursResp, apptsResp] = await Promise.all([
        clinicHoursApi.getClinicHours(),
        appointmentApi.getAppointments(dateStr),
      ]);
      const hours = Array.isArray(hoursResp) ? hoursResp : (hoursResp.data || []);
      const appts = Array.isArray(apptsResp) ? apptsResp : (apptsResp.data || []);
      setClinicHours(hours);
      setAppointments(appts);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

  const dayOfWeek = new Date(selectedDate).getDay();
  const hoursForDay = clinicHours.find((h) => h.dayOfWeek === dayOfWeek);

  const availableSlots = useMemo(() => {
    if (!hoursForDay || hoursForDay.isClosed) return [];
    const slots = buildSlots(hoursForDay.openTime, hoursForDay.closeTime, hoursForDay.slotMinutes || 20);
    const booked = new Set(
      appointments
        .filter((a) => a.status !== 'cancelled')
        .map((a) => getLocalTime(a.scheduledAt))
    );
    return slots.filter((s) => !booked.has(s));
  }, [hoursForDay, appointments]);

  const handleBook = async (payload) => {
    await appointmentApi.createAppointment(payload);
    await loadData(selectedDate);
  };

  const handleUpdate = async (payload) => {
    if (!editing) return;
    await appointmentApi.updateAppointment(editing.id, payload);
    await loadData(selectedDate);
  };

  const handleCancel = async (appointmentId) => {
    await appointmentApi.cancelAppointment(appointmentId);
    await loadData(selectedDate);
  };

  const handleCheckIn = async (appointmentId) => {
    await appointmentApi.checkInAppointment(appointmentId);
    await loadData(selectedDate);
  };

  const columns = [
    {
      key: 'time',
      label: t('appointments.time'),
      render: (a) => formatTime12h(getLocalTime(a.scheduledAt)),
    },
    {
      key: 'patient',
      label: t('appointments.patient'),
      render: (a) => a.patient?.name || `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim(),
    },
    {
      key: 'visitType',
      label: t('appointments.visitType'),
      render: (a) => (a.visitType === 'consultation' ? t('appointments.consultation') : t('appointments.examination')),
    },
    {
      key: 'status',
      label: t('appointments.status'),
      render: (a) => t(`appointments.statuses.${a.status || 'booked'}`),
    },
    {
      key: 'arrival',
      label: t('appointments.arrival'),
      render: (a) => (a.status === 'checked_in' || a.status === 'completed'
        ? t('appointments.arrived')
        : t('appointments.notArrived')),
    },
    ...(canManage ? [{
      key: 'actions',
      label: t('appointments.actions'),
      render: (a) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(a);
              setShowModal(true);
            }}
          >
            {t('common.edit')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckIn(a.id);
            }}
            disabled={a.status !== 'booked'}
          >
            {t('appointments.checkIn')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel(a.id);
            }}
            disabled={a.status === 'cancelled' || a.status === 'checked_in' || a.status === 'completed'}
          >
            {t('common.cancel')}
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('appointments.title')}</h1>
          <p className="text-gray-600 dark:text-gray-100 mt-1">{t('appointments.subtitle')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('appointments.timeFormat')}</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.MANAGE_APPOINTMENTS}>
          <Button onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={18} />
            {t('appointments.newBooking')}
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <Calendar className="text-green-500" size={20} />
          <DatePicker value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
        {hoursForDay?.isClosed && (
          <div className="text-sm text-red-600 mt-3">{t('appointments.closedDay')}</div>
        )}
        {!hoursForDay?.isClosed && hoursForDay && (
          <div className="text-sm text-gray-500 mt-3">
            {t('appointments.hoursLabel')}: {formatTime12h(hoursForDay.openTime)} - {formatTime12h(hoursForDay.closeTime)} • {hoursForDay.slotMinutes} {t('appointments.minutes')}
          </div>
        )}
      </Card>

      <Card>
        <Table
          columns={columns}
          data={appointments}
          loading={loading}
          onRowClick={(row) => {
            if (!canManage) return;
            setEditing(row);
            setShowModal(true);
          }}
        />
      </Card>

      <AppointmentFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={editing ? handleUpdate : handleBook}
        date={selectedDate}
        timeSlots={availableSlots}
        initialAppointment={editing}
      />
    </div>
  );
}
