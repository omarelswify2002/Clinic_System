import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Card, Button, Table, Badge } from '../../shared/ui';
import { visitApi } from '../../services/api';
import { formatDate } from '../../shared/utils';
import { VISIT_STATUS } from '../../shared/constants';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

const statusVariants = {
  [VISIT_STATUS.SCHEDULED]: 'info',
  [VISIT_STATUS.IN_PROGRESS]: 'warning',
  [VISIT_STATUS.COMPLETED]: 'success',
  [VISIT_STATUS.CANCELLED]: 'gray',
};

export default function VisitList() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  const statusLabels = {
    [VISIT_STATUS.SCHEDULED]: t('visits.scheduled'),
    [VISIT_STATUS.IN_PROGRESS]: t('visits.inProgress'),
    [VISIT_STATUS.COMPLETED]: t('visits.completed'),
    [VISIT_STATUS.CANCELLED]: t('visits.cancelled'),
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await visitApi.getAllVisits();
      setVisits(data);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'visitDate',
      label: t('visits.date'),
      render: (visit) => formatDate(visit.visitDate, 'PPp'),
    },
    {
      key: 'patient',
      label: t('visits.patient'),
      render: (visit) => `${visit.patient.firstName} ${visit.patient.lastName}`,
    },
    {
      key: 'chiefComplaint',
      label: t('visits.chiefComplaint'),
    },
    {
      key: 'diagnosis',
      label: t('visits.diagnosis'),
      render: (visit) => visit.diagnosis || '-',
    },
    {
      key: 'status',
      label: t('visits.status'),
      render: (visit) => (
        <Badge variant={statusVariants[visit.status]}>
          {statusLabels[visit.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : ''}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visits.title')}</h1>
          <p className="text-gray-600 dark:text-gray-100 mt-1">{t('visits.viewManageVisits')}</p>
        </div>
        <Button onClick={() => navigate('/visits/new')}>
          <Plus size={20} />
          {t('visits.newVisit')}
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={visits}
          onRowClick={(visit) => navigate(`/visits/${visit.id}`)}
          loading={loading}
        />
      </Card>
    </div>
  );
}

