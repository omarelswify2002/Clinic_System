import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Modal, Input, Button } from '../../shared/ui';
import { patientApi } from '../../services/api';
import { useTranslation } from '../../shared/i18n';

const getPatientLabel = (patient) => {
  if (!patient) return '';
  if (patient.firstName || patient.lastName) {
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  }
  return patient.name || '';
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

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSave,
  date,
  timeSlots = [],
  initialAppointment = null,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [idSearch, setIdSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [visitType, setVisitType] = useState('consultation');
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [notes, setNotes] = useState('');
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    if (initialAppointment) {
      setSelectedPatient(initialAppointment.patient || null);
      const time = getLocalTime(initialAppointment.scheduledAt);
      setSelectedTime(time);
      setVisitType(initialAppointment.visitType || 'consultation');
      setIsNewPatient(Boolean(initialAppointment.isNewPatient));
      setNotes(initialAppointment.notes || '');
    } else {
      resetForm();
    }
  }, [isOpen, initialAppointment]);

  const resetForm = () => {
    setSearchQuery('');
    setIdSearch('');
    setSearchResults([]);
    setSelectedPatient(null);
    setSelectedTime('');
    setVisitType('consultation');
    setIsNewPatient(false);
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() && !idSearch.trim()) return;
    try {
      setSearching(true);
      if (idSearch.trim()) {
        const raw = idSearch.trim();
        const digitsOnly = /^#?\d+$/.test(raw);
        const digits = raw.replace(/\D/g, '');
        if (digitsOnly && digits) {
          const patient = await patientApi.getPatientById(digits);
          setSearchResults(patient ? [patient] : []);
        } else {
          const results = await patientApi.searchPatients(raw);
          const q = raw.toLowerCase();
          setSearchResults(results.filter(p => p.nationalId?.toLowerCase().includes(q)));
        }
        return;
      }
      const results = await patientApi.searchPatients(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Patient search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedTime) return;

    const scheduledAt = new Date(`${date}T${selectedTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) return;

    try {
      setSaving(true);
      const payload = {
        scheduledAt: scheduledAt.toISOString(),
        visitType,
        isNewPatient,
        notes,
      };
      if (!initialAppointment) {
        payload.patientId = selectedPatient.id;
      }
      await onSave(payload);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const availableTimes = initialAppointment
    ? Array.from(new Set([selectedTime, ...timeSlots])).filter(Boolean)
    : timeSlots;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialAppointment ? t('appointments.editBooking') : t('appointments.newBooking')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!selectedPatient ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
              <input
                type="text"
                placeholder={`${t('patients.searchById')} (#15)`}
                value={idSearch}
                onChange={(e) => setIdSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={t('appointments.searchPatient')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="flex-1"
              />
              <Button type="button" onClick={handleSearch} loading={searching}>
                <Search size={20} />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg divide-y dark:divide-gray-600 max-h-64 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {patient.nationalId} • {patient.phone}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(searchQuery || idSearch) && searchResults.length === 0 && !searching && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {t('patients.noPatients')}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getPatientLabel(selectedPatient)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPatient.nationalId || selectedPatient.nationalID || ''}
                  </div>
                </div>
                {!initialAppointment && (
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                    {t('common.edit')}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('appointments.time')}
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('common.select')}</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{formatTime12h(time)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('appointments.visitType')}
                </label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consultation">{t('appointments.consultation')}</option>
                  <option value="examination">{t('appointments.examination')}</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isNewPatient}
                onChange={(e) => setIsNewPatient(e.target.checked)}
              />
              {t('appointments.newPatient')}
            </label>

            <Input
              label={t('appointments.notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('appointments.notesPlaceholder')}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={handleClose} type="button">
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={saving}>
                {initialAppointment ? t('common.saveChanges') : t('appointments.book')}
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
