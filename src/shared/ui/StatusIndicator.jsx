import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { SYNC_STATUS } from '../constants';
import { useTranslation } from '../i18n';

export default function StatusIndicator({ status }) {
  const { t } = useTranslation();

  const statusConfig = {
    [SYNC_STATUS.ONLINE]: {
      icon: Wifi,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      label: t('status.online'),
    },
    [SYNC_STATUS.OFFLINE]: {
      icon: WifiOff,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      label: t('status.offline'),
    },
    [SYNC_STATUS.SYNCING]: {
      icon: RefreshCw,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      label: t('status.syncing'),
    },
  };

  const config = statusConfig[status] || statusConfig[SYNC_STATUS.OFFLINE];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
      <motion.div
        animate={status === SYNC_STATUS.SYNCING ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Icon size={16} className={config.color} />
      </motion.div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

