import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ClipboardList, FileText, TrendingUp } from 'lucide-react';
import { Card } from '../../shared/ui';
import { patientApi, queueApi, visitApi } from '../../services/api';
import StatCard from './StatCard';
import QueuePreview from './QueuePreview';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';
  const [stats, setStats] = useState({
    patients: { total: 0, newToday: 0 },
    queue: { total: 0, waiting: 0 },
    visits: { total: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [patientStats, queueStats, todayVisits] = await Promise.all([
        patientApi.getPatientStats(),
        queueApi.getQueueStats(),
        visitApi.getTodayVisits(),
      ]);

      setStats({
        patients: patientStats,
        queue: queueStats,
        visits: { total: todayVisits.length },
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('dashboard.totalPatients'),
      value: stats.patients.total + 1,
      subtitle: `${stats.patients.newToday} ${t('dashboard.newToday')}`,
      icon: Users,
      color: 'blue',
    },
    {
      title: t('dashboard.queueToday'),
      value: stats.queue.waiting,
      subtitle: `${stats.queue.total} ${t('dashboard.total')}`,
      icon: ClipboardList,
      color: 'yellow',
    },
    {
      title: t('dashboard.visitsToday'),
      value: stats.visits.total,
      subtitle: t('dashboard.completedInProgress'),
      icon: FileText,
      color: 'green',
    },
    {
      title: t('dashboard.completed'),
      value: stats.queue.completed,
      subtitle: t('dashboard.patientsServed'),
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.welcome')}</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
      >
        <QueuePreview />

        <Card title={t('dashboard.quickActions')}>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, x: isRTL ? -4 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/patients')}
              className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.addPatient')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.addPatientDesc')}</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: isRTL ? -4 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/queue')}
              className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.addToQueue')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.addToQueueDesc')}</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: isRTL ? -4 : 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/visits')}
              className="w-full p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.newVisit')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.newVisitDesc')}</div>
            </motion.button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

