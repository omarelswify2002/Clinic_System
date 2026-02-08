import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Card, Button, Badge } from '../../shared/ui';
import { queueApi } from '../../services/api';
import { QUEUE_STATUS } from '../../shared/constants';
import { formatRelativeTime } from '../../shared/utils';
import AddToQueueModal from './AddToQueueModal';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';
import { useAuthStore } from '../../app/store';

const statusVariants = {
  [QUEUE_STATUS.WAITING]: 'warning',
  [QUEUE_STATUS.IN_PROGRESS]: 'info',
  [QUEUE_STATUS.COMPLETED]: 'success',
  [QUEUE_STATUS.CANCELLED]: 'gray',
};

export default function QueueManagement() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0,
    consultationTotal: 0,
    visitTotal: 0,
    completedConsultations: 0,
    completedVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';
  const user = useAuthStore((state) => state.user);

  // Only doctors can complete visits
  const canComplete = user?.role === 'doctor' || user?.role === 'admin';

  const statusLabels = {
    [QUEUE_STATUS.WAITING]: t('queue.waiting'),
    [QUEUE_STATUS.IN_PROGRESS]: t('queue.inProgress'),
    [QUEUE_STATUS.COMPLETED]: t('queue.completed'),
    [QUEUE_STATUS.CANCELLED]: t('queue.cancelled'),
  };

  useEffect(() => {
    loadQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      // Load both queue and stats
      const [queueData, statsData] = await Promise.all([
        queueApi.getTodayQueue(),
        queueApi.getQueueStats(),
      ]);
      setQueue(queueData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (queueId, newStatus) => {
    try {
      await queueApi.updateQueueStatus(queueId, newStatus);
      loadQueue();
    } catch (error) {
      console.error('Failed to update queue status:', error);
    }
  };

  const handleRemove = async (queueId) => {
    if (!confirm(t('queue.confirmRemove'))) {
      return;
    }
    try {
      await queueApi.removeFromQueue(queueId);
      loadQueue();
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  };

  const handlePatientAdded = () => {
    setShowAddModal(false);
    loadQueue();
  };

  return (
    <div className="space-y-6">
      {isRTL ? (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={loadQueue}>
              <RefreshCw size={20} />
              {t('queue.refresh')}
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              {t('queue.addToQueue')}
            </Button>
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('queue.queueManagement')}</h1>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{t('queue.manageTodayQueue')}</p>
          </div>
        </div>
        ) : (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('queue.queueManagement')}</h1>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{t('queue.manageTodayQueue')}</p>
          </div>
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" onClick={loadQueue}>
              <RefreshCw size={20} />
              {t('queue.refresh')}
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              {t('queue.addToQueue')}
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.waiting}</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{t('queue.waiting')}</div>
          </div>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">{t('queue.inProgress')}</div>
          </div>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.consultationTotal}</div>
            <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {t('queue.consultation')}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {t('queue.completed')}: {stats.completedConsultations}
            </div>
          </div>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.visitTotal}</div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">{t('queue.visits')}</div>
            <div className="text-xs text-green-700 dark:text-green-300 mt-1">
              {t('queue.completed')}: {stats.completedVisits}
            </div>
          </div>
        </Card>
      </div>

      <Card title={t('queue.title')}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t('queue.noQueue')}
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  item.isUrgent || item.priority === 'urgent'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 border-l-4'
                    : item.priority === 'consultation' 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 border-l-4'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                {isRTL ? (
                  <>
                    {/* RTL: Badge on right, content in middle, number on left */}
                    <div className="flex gap-2 mr-4">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemove(item.id)}
                      >
                        {t('queue.remove')}
                      </Button>
                      {item.status === QUEUE_STATUS.WAITING && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.id, QUEUE_STATUS.IN_PROGRESS)}
                        >
                          {t('queue.start')}
                        </Button>
                      )}
                      {item.status === QUEUE_STATUS.IN_PROGRESS && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(item.id, QUEUE_STATUS.COMPLETED)}
                          disabled={!canComplete}
                          title={!canComplete ? t('queue.onlyDoctorCanComplete') : ''}
                        >
                          {t('queue.completed')}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1">
                      <Badge variant={statusVariants[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                      <div className="flex-1 gap-1 text-right">
                        <div>
                          <div className={`font-medium ${
                            item.isUrgent || item.priority === 'urgent'
                              ? 'text-red-900 dark:text-red-100'
                              : item.priority === 'consultation' 
                              ? 'text-yellow-900 dark:text-yellow-100'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {item.patient.firstName} {item.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {item.patient.nationalId} • {formatRelativeTime(item.arrivalTime)}
                          </div>
                          {item.notes && (
                            <div className={`text-sm mt-1 ${
                              item.isUrgent || item.priority === 'urgent'
                                ? 'text-red-700 dark:text-red-300 font-medium'
                                : item.priority === 'consultation' 
                                ? 'text-yellow-700 dark:text-yellow-300 font-medium'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>{item.notes}</div>
                          )}
                        </div>

                        <div className='w-28 mt-1'>
                          {item.priority === 'urgent' ? (
                            <div className="bg-red-500 text-sm px-2 py-1 rounded-lg">
                              <p className="text-white font-bold text-center">
                                {t('queue.urgent')}
                              </p>
                            </div>
                          ) : item.priority === 'consultation' ? (
                            <div className="bg-yellow-500 text-sm px-2 py-1 rounded-lg">
                              <p className="text-white font-bold text-center">
                                {t('queue.consultation')}
                              </p>
                            </div>
                          ):''}
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        item.isUrgent || item.priority === 'urgent'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          : item.priority === 'consultation' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.queueNumber}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* LTR: Number on left, content in middle, badge on right */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        item.isUrgent || item.priority === 'urgent'
                          ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                          : item.priority === 'consultation' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.queueNumber}
                      </div>
                      <div className="flex-1 gap-1 text-left">
                        <div>
                          <div className={`font-medium ${
                            item.isUrgent || item.priority === 'urgent'
                              ? 'text-red-900 dark:text-red-100'
                              : item.priority === 'consultation' 
                              ? 'text-yellow-900 dark:text-yellow-100'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}>
                            {item.patient.firstName} {item.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {item.patient.nationalId} • {formatRelativeTime(item.arrivalTime)}
                          </div>
                          {item.notes && (
                            <div className={`text-sm mt-1 ${
                              item.isUrgent || item.priority === 'urgent'
                                ? 'text-red-700 dark:text-red-300 font-medium'
                                : item.priority === 'consultation' 
                                ? 'text-yellow-700 dark:text-yellow-300 font-medium'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}>{item.notes}</div>
                          )}
                        </div>
                        <div className='w-28 mt-1'>
                          {item.priority === 'urgent' ? (
                            <div className="bg-red-500 text-sm px-2 py-1 rounded-lg">
                              <p className="text-white font-bold text-center">
                                {t('queue.urgent')}
                              </p>
                            </div>
                          ) : item.priority === 'consultation' ? (
                            <div className="bg-yellow-500 text-sm px-2 py-1 rounded-lg">
                              <p className="text-white font-bold text-center">
                                {t('queue.consultation')}
                              </p>
                            </div>
                          ):''}
                        </div>
                      </div>
                      <Badge variant={statusVariants[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {item.status === QUEUE_STATUS.WAITING && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.id, QUEUE_STATUS.IN_PROGRESS)}
                        >
                          {t('queue.start')}
                        </Button>
                      )}
                      {item.status === QUEUE_STATUS.IN_PROGRESS && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleStatusChange(item.id, QUEUE_STATUS.COMPLETED)}
                          disabled={!canComplete}
                          title={!canComplete ? t('queue.onlyDoctorCanComplete') : ''}
                        >
                          {t('queue.completed')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemove(item.id)}
                      >
                        {t('queue.remove')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <AddToQueueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}

