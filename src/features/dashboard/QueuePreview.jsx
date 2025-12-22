import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge } from '../../shared/ui';
import { queueApi } from '../../services/api';
import { ROUTES, QUEUE_STATUS } from '../../shared/constants';
import { formatRelativeTime } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

const statusVariants = {
  [QUEUE_STATUS.WAITING]: 'warning',
  [QUEUE_STATUS.IN_PROGRESS]: 'info',
  [QUEUE_STATUS.COMPLETED]: 'success',
};

const mapStatusKey = (status) => (status === 'in_progress' ? 'inProgress' : status);
export default function QueuePreview() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const data = await queueApi.getTodayQueue();
      setQueue(data.slice(0, 5)); // Show only first 5
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={t('queuePreview.todaysQueue')} 
      actions={
        <button
          onClick={() => navigate(ROUTES.QUEUE)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('queuePreview.viewAll')}
        </button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('queuePreview.noPatientsInQueue')}
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {item.queueNumber}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {item.patient.firstName} {item.patient.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRelativeTime(item.arrivalTime)}
                  </div>
                </div>
              </div>
              <Badge variant={statusVariants[item.status]}>
                <span dir="auto">{t(`queue.${mapStatusKey(item.status)}`)}</span>
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

