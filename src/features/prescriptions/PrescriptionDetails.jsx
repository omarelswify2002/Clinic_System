import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit } from 'lucide-react';
import { Card, Button, PermissionGuard } from '../../shared/ui';
import { prescriptionApi } from '../../services/api';
import { formatDate, PERMISSIONS } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function PrescriptionDetails() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const data = await prescriptionApi.getPrescriptionById(prescriptionId);
      setPrescription(data);
    } catch (error) {
      console.error('Failed to load prescription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
      {/* Header - Hidden when printing */}
      <div className="flex items-center gap-4 print:hidden">
        <Button variant="outline" onClick={() => navigate('/prescriptions')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('prescriptions.prescription')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(prescription.prescriptionDate, 'PPp')}
          </p>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission={PERMISSIONS.EDIT_PRESCRIPTION}>
            <Button variant="primary" onClick={() => navigate(`/prescriptions/${prescriptionId}/edit`)}>
              <Edit size={20} />
              {t('common.edit')}
            </Button>
          </PermissionGuard>
          <Button onClick={handlePrint}>
            <Printer size={20} />
            {t('prescriptions.print')}
          </Button>
        </div>
      </div>

      {/* Prescription Content - This is what gets printed */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 print:border-0 print:shadow-none print:p-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{t('prescriptions.medicalPrescription')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('prescriptions.clinicName')}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('prescriptions.patientInfo')}</h3>
            <div className="space-y-1 text-sm">
              <div className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.name')}:</span>{' '}
                {prescription.patient.firstName} {prescription.patient.lastName}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.nationalId')}:</span>{' '}
                {prescription.patient.nationalId}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.phone')}:</span> {prescription.patient.phone}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('prescriptions.doctorInfo')}</h3>
            <div className="space-y-1 text-sm">
              <div className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.doctor')}:</span> {prescription.doctorName}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.date')}:</span>{' '}
                {formatDate(prescription.prescriptionDate, 'PPp')}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('prescriptions.medications')}</h3>
          <div className="space-y-4">
            {prescription.medications.map((med, index) => (
              <div key={med.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {index + 1}. {med.name} - {med.dosage}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.frequency')}:</span> {med.frequency}
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.duration')}:</span> {med.duration}
                  </div>
                </div>
                {med.instructions && (
                  <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 dark:text-gray-400">{t('prescriptions.instructions')}:</span> {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {prescription.additionalNotes && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('prescriptions.additionalNotes')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{prescription.additionalNotes}</p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <div className={language === 'ar' ? 'text-left' : 'text-right'}>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('prescriptions.doctorSignature')}</div>
            <div className={`mt-8 border-t border-gray-400 dark:border-gray-600 w-48 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

