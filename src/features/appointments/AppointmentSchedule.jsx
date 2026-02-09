import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, Table, DatePicker } from '../../shared/ui';
import { appointmentApi } from '../../services/api';
import { useTranslation } from '../../shared/i18n';

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

export default function AppointmentSchedule() {
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadData = async (dateStr) => {
    try {
      setLoading(true);
      const data = await appointmentApi.getAppointments(dateStr);
      const list = Array.isArray(data) ? data : (data.data || []);
      setAppointments(list);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate]);

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
      key: 'arrival',
      label: t('appointments.arrival'),
      render: (a) => (a.status === 'checked_in' || a.status === 'completed'
        ? t('appointments.arrived')
        : t('appointments.notArrived')),
    },
    {
      key: 'status',
      label: t('appointments.status'),
      render: (a) => t(`appointments.statuses.${a.status || 'booked'}`),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('appointments.schedule')}</h1>
        <p className="text-gray-600 dark:text-gray-100 mt-1">{t('appointments.scheduleDesc')}</p>
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <Calendar className="text-green-500" size={20} />
          <DatePicker value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={appointments} loading={loading} />
      </Card>
    </div>
  );
}
