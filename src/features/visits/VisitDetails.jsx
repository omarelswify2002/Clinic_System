import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, Button, Badge } from '../../shared/ui';
import { visitApi } from '../../services/api';
import { formatDate } from '../../shared/utils';
import { VISIT_STATUS } from '../../shared/constants';
import { useTranslation } from '../../shared/i18n';
// import { useSettingsStore } from '../../app/settingsStore';

const statusVariants = {
  [VISIT_STATUS.SCHEDULED]: 'info',
  [VISIT_STATUS.IN_PROGRESS]: 'warning',
  [VISIT_STATUS.COMPLETED]: 'success',
  [VISIT_STATUS.CANCELLED]: 'gray',
};

export default function VisitDetails() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  // const { direction } = useSettingsStore();
  // const isRTL = direction === 'rtl';

  useEffect(() => {
    loadVisit();
  }, [visitId]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      const data = await visitApi.getVisitById(visitId);
      setVisit(data);
    } catch (error) {
      console.error('Failed to load visit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('visits.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/visits')}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visits.visitDetails')}</h1>
          <p className="text-gray-600 mt-1">{formatDate(visit.visitDate, 'PPp')}</p>
        </div>
        <Badge variant={statusVariants[visit.status]}>
          {visit.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('visits.patientInfo')}>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">{t('visits.patient')}</div>
              <div className="font-medium">
                {visit.patient.firstName} {visit.patient.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('patients.nationalId')}</div>
              <div className="font-medium">{visit.patient.nationalId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('patients.phone')}</div>
              <div className="font-medium">{visit.patient.phone}</div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card title={t('visits.visitInfo')}>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-500">{t('visits.chiefComplaint')}</div>
                <div className="mt-1">{visit.chiefComplaint}</div>
              </div>
              {visit.diagnosis && (
                <div>
                  <div className="text-sm font-medium text-gray-500">{t('visits.diagnosis')}</div>
                  <div className="mt-1">{visit.diagnosis}</div>
                </div>
              )}
              {visit.notes && (
                <div>
                  <div className="text-sm font-medium text-gray-500">{t('visits.notes')}</div>
                  <div className="mt-1">{visit.notes}</div>
                </div>
              )}
            </div>
          </Card>

          {visit.vitalSigns && (
            <Card title={t('visits.vitalSigns')}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {visit.vitalSigns.temperature && (
                  <div>
                    <div className="text-sm text-gray-500">{t('visits.temperature')}</div>
                    <div className="font-medium">{visit.vitalSigns.temperature} {t('visits.temperatureUnit')}</div>
                  </div>
                )}
                {visit.vitalSigns.bloodPressure && (
                  <div>
                    <div className="text-sm text-gray-500">{t('visits.bloodPressure')}</div>
                    <div className="font-medium">{visit.vitalSigns.bloodPressure}</div>
                  </div>
                )}
                {visit.vitalSigns.heartRate && (
                  <div>
                    <div className="text-sm text-gray-500">{t('visits.heartRate')}</div>
                    <div className="font-medium">{visit.vitalSigns.heartRate} {t('visits.heartRateUnit')}</div>
                  </div>
                )}
                {visit.vitalSigns.weight && (
                  <div>
                    <div className="text-sm text-gray-500">{t('visits.weight')}</div>
                    <div className="font-medium">{visit.vitalSigns.weight} {t('visits.weightUnit')}</div>
                  </div>
                )}
                {visit.vitalSigns.height && (
                  <div>
                    <div className="text-sm text-gray-500">{t('visits.height')}</div>
                    <div className="font-medium">{visit.vitalSigns.height} {t('visits.heightUnit')}</div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

