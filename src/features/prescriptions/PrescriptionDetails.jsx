import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, MapPinned, Phone  } from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa6";
import { LuPhone } from "react-icons/lu";
import { Card, Button, PermissionGuard } from '../../shared/ui';
import { prescriptionApi } from '../../services/api';
import { formatDate, PERMISSIONS } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function PrescriptionDetails() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const language = useSettingsStore((state) => state.language);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const consultationDate =
    prescription.consultationDate ||
    prescription.appointmentDate ||
    prescription.consultation_date ||
    null;

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
        <div>
          <div className="grid grid-cols-2 mb-8">
            <div className='flex flex-col gap-1 items-center justify-center'>
              <h3 className="font-semibold text-xl ElBannaDr dark:text-gray-100">دكتور</h3>
              <h1 className='font-bold text-3xl ElBannaName  dark:text-gray-100'>خالد أحمد البنا</h1>
              <div className='flex font-medium flex-col items-center justify-center ElBannaInfo  dark:text-gray-100'>
                <p>أستاذ الباطنة العامة - كلية الطب</p>
                <p>دكتوراه الغدد الصماء والسكر والغدة الدرقية</p>
                <p>إستشاري الكبد والجهاز الهضمي</p>
              </div>
            </div>

            <div className='flex flex-col items-center justify-center'>
              <h3 className="font-semibold text-xl ElBannaDr dark:text-gray-100">Dr</h3>
              <h1 className='font-bold text-3xl ElBannaName  dark:text-gray-100'>Khaled El Banna</h1>
              <div className='flex font-medium flex-col items-center justify-center ElBannaInfo  dark:text-gray-100'>
                <p>A. Prof Of Internal Medicine</p>
                <p>Zagazig University</p>
                <p>Endocrinologist</p>
              </div>
            </div>
          </div>
          {isRTL ? (          
            <div className={`flex items-center justify-evenly border-y border-gray-900`}>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formatDate(prescription.prescriptionDate, 'PPp')}
              </p>
              {consultationDate && (
                <div className="text-gray-900 dark:text-gray-100">
                  <span className="ElBannaName dark:text-gray-400">{t('prescriptions.consultationDate')}:</span>{' '}
                  {formatDate(consultationDate, 'PP')}
                </div>
              )}
              <div className="text-gray-900 dark:text-gray-100">
                <span className="ElBannaName dark:text-gray-400">{t('prescriptions.age')}:</span>{' '}
                {prescription.patient.age}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="ElBannaName dark:text-gray-400">{t('prescriptions.name')}:</span>{' '}
                {prescription.patient.firstName} {prescription.patient.lastName}
              </div>
            </div>
            ) : (
            <div className={`flex items-center justify-evenly border-y border-gray-900`}>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="ElBannaName dark:text-gray-400">{t('prescriptions.name')}:</span>{' '}
                {prescription.patient.firstName} {prescription.patient.lastName}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <span className="ElBannaName dark:text-gray-400">{t('prescriptions.age')}:</span>{' '}
                {prescription.patient.age}
              </div>
              {consultationDate && (
                <div className="text-gray-900 dark:text-gray-100">
                  <span className="ElBannaName dark:text-gray-400">{t('prescriptions.consultationDate')}:</span>{' '}
                  {formatDate(consultationDate, 'PP')}
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formatDate(prescription.prescriptionDate, 'PPp')}
              </p>
            </div>
          )}
        </div>

        <div className="my-8">
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

        {consultationDate && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('prescriptions.consultationDate')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(consultationDate, 'PP')}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center ElBannaFooter border-y border-gray-900 dark:border-gray-700 px-6 py-4 mt-8">
          <div className='flex items-center justify-center gap-4 mb-1'>
            <div className='flex flex-col items-start justify-center'>
              <p className='flex items-center justify-center gap-1'>2867999<FaWhatsapp className='ElBnnaIcon text-2xl' />01040705096</p>
              <p className='flex items-center justify-center gap-1'><LuPhone className='ElBnnaIcon text-2xl' />01093995093</p>
            </div>
            <div className='flex flex-col items-start justify-center'>
              <p className='flex items-center justify-center gap-1'>بلبيس.شارع أبو بكر الصديق.أمام مطعم المنصور بجوار صيدلية القادسية<MapPinned  className='ElBnnaIcon text-2xl' /></p>
              <p className='flex items-center justify-center gap-1'>العاشر من رمضان.الأردنية.سيتي سنتر.برج  .أعلى مركز براعم<MapPinned  className='ElBnnaIcon text-2xl' /></p>
            </div>
          </div>
          <span className='ElBnnaIcon dark:text-white'>الكشف والإعادة بحجز مسبق</span>
        </div>
      </div>
    </div>
  );
}

