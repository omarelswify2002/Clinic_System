import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Calendar } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Card, Button, Input } from '../../shared/ui';
import { prescriptionApi } from '../../services/api';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function EditPrescription() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [medications, setMedications] = useState([]);
  const [notes, setNotes] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationDateEnabled, setConsultationDateEnabled] = useState(false);
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  useEffect(() => {
    loadPrescription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionId]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const data = await prescriptionApi.getPrescriptionById(prescriptionId);
      console.log('edit prescription page > data >>>',data);
      setPrescription(data);
      setMedications(data.medications || []);
      setNotes(data.additionalNotes || ''); // Changed from data.notes to data.additionalNotes
      setConsultationDate(
        data.consultationDate ? new Date(data.consultationDate).toISOString().split('T')[0] : ''
      );
      setConsultationDateEnabled(Boolean(data.consultationDate));
    } catch (error) {
      console.error('Failed to load prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: `temp-${Date.now()}`,
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate medications
      const validMedications = medications.filter(
        (med) => med.name && med.dosage && med.frequency && med.duration
      );

      if (validMedications.length === 0) {
        alert('Please add at least one complete medication');
        return;
      }

      await prescriptionApi.updatePrescription(prescriptionId, {
        medications: validMedications,
        additionalNotes: notes, // Changed from 'notes' to 'additionalNotes'
        consultationDate: consultationDateEnabled ? (consultationDate || null) : null,
      });

      navigate(`/prescriptions/${prescriptionId}`);
    } catch (error) {
      console.error('Failed to save prescription:', error);
      alert('Failed to save prescription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Prescription not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="outline" onClick={() => navigate(`/prescriptions/${prescriptionId}`)}>
            <ArrowLeft size={20} />
          </Button>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('prescriptions.editPrescription')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('prescriptions.patient')}: {prescription.patient.firstName} {prescription.patient.lastName}
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <Save size={20} />
          {t('prescriptions.saveChanges')}
        </Button>
      </div>

      <Card title={t('prescriptions.patientInfo')}>
        <div className={`grid grid-cols-2 gap-4 text-sm ${isRTL ? 'text-right' : ''}`}>
          <div>
            <span className="text-gray-500 dark:text-gray-300">{t('prescriptions.name')}:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {prescription.patient.firstName} {prescription.patient.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-300">{t('prescriptions.nationalId')}:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">{prescription.patient.nationalId}</span>
          </div>
          {/* <div>
            <span className="text-gray-500 dark:text-gray-300">{t('prescriptions.age')}:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">{prescription.patient.age} {t('prescriptions.years')}</span>
          </div> */}
          <div>
            <span className="text-gray-500 dark:text-gray-300">{t('prescriptions.doctor')}:</span>{' '}
            <span className="font-medium text-gray-900 dark:text-white">{prescription.doctorName}</span>
          </div>
        </div>
      </Card>

      <Card title={t('prescriptions.consultationDate')}>
        <div className="space-y-3">
          <label className={`flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 ${isRTL ? 'justify-end' : ''}`}>
            <input
              type="checkbox"
              checked={consultationDateEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                setConsultationDateEnabled(enabled);
                if (!enabled) {
                  setConsultationDate('');
                }
              }}
            />
            {t('prescriptions.setConsultationDate')}
          </label>
          <Input
            type="date"
            icon={Calendar}
            value={consultationDate}
            onChange={(e) => setConsultationDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            disabled={!consultationDateEnabled}
          />
        </div>
      </Card>

      <Card title={t('prescriptions.medications')}>
        <div className="space-y-4">
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h4 className="font-semibold text-gray-900 dark:text-white">{t('prescriptions.medication')} {index + 1}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedication(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('prescriptions.medicationName')}
                  value={med.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  placeholder="e.g., Amoxicillin"
                  required
                />
                <Input
                  label={t('prescriptions.dosage')}
                  value={med.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  placeholder="e.g., 500mg"
                  required
                />
                <Input
                  label={t('prescriptions.frequency')}
                  value={med.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  placeholder="e.g., 3 times daily"
                  required
                />
                <Input
                  label={t('prescriptions.duration')}
                  value={med.duration}
                  onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                  placeholder="e.g., 7 days"
                  required
                />
              </div>

              <div className="mt-4">
                <Input
                  label={t('prescriptions.instructions')}
                  value={med.instructions}
                  onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  placeholder="e.g., Take with food"
                />
              </div>
            </motion.div>
          ))}

          <Button variant="outline" onClick={addMedication} className="w-full">
            <Plus size={20} />
            {t('prescriptions.addMedication')}
          </Button>
        </div>
      </Card>

      <Card title={t('prescriptions.additionalNotes')}>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes or instructions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] text-gray-900"
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/prescriptions/${prescriptionId}`)}>
          {t('prescriptions.cancel')}
        </Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <Save size={20} />
          {t('prescriptions.saveChanges')}
        </Button>
      </div>
    </div>
  );
}

