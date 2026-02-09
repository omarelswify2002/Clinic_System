import { useEffect, useState } from 'react';
import { Card, Button } from '../../shared/ui';
import { clinicHoursApi } from '../../services/api';
import { useTranslation } from '../../shared/i18n';

const dayKeys = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

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

export default function ClinicHoursSettings() {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await clinicHoursApi.getClinicHours();
        const list = Array.isArray(data) ? data : (data.data || []);
        setHours(list.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
      } catch (error) {
        console.error('Failed to load clinic hours:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (dayOfWeek, field, value) => {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      await Promise.all(
        hours.map((h) =>
          clinicHoursApi.updateClinicHours(h.dayOfWeek, {
            openTime: h.openTime,
            closeTime: h.closeTime,
            slotMinutes: Number(h.slotMinutes) || 20,
            isClosed: Boolean(h.isClosed),
          })
        )
      );
    } catch (error) {
      console.error('Failed to update clinic hours:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('appointments.clinicHours')}</h1>
        <p className="text-gray-600 dark:text-gray-100 mt-1">{t('appointments.clinicHoursDesc')}</p>
        {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('appointments.timeFormat')}</p> */}
      </div>

      <Card>
        <div className="space-y-4">
          {hours.map((h) => (
            <div key={h.dayOfWeek} className="grid grid-cols-5 gap-3 items-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t(`appointments.days.${dayKeys[h.dayOfWeek]}`)}
              </div>
              <input
                type="time"
                value={h.openTime}
                onChange={(e) => updateField(h.dayOfWeek, 'openTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                disabled={h.isClosed}
              />
              <input
                type="time"
                value={h.closeTime}
                onChange={(e) => updateField(h.dayOfWeek, 'closeTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                disabled={h.isClosed}
              />
              <input
                type="number"
                min="5"
                max="120"
                value={h.slotMinutes}
                onChange={(e) => updateField(h.dayOfWeek, 'slotMinutes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                disabled={h.isClosed}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={Boolean(h.isClosed)}
                  onChange={(e) => updateField(h.dayOfWeek, 'isClosed', e.target.checked)}
                />
                {t('appointments.closed')}
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400 col-span-5">
                {formatTime12h(h.openTime)} - {formatTime12h(h.closeTime)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-6">
          <Button onClick={saveAll} loading={saving}>
            {t('common.saveChanges')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
