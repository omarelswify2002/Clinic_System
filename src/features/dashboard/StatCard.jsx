import { motion } from 'framer-motion';
import { useSettingsStore } from '../../app/settingsStore.js';

const colorClasses = {
  blue: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
  green: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
  yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600',
  purple: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600',
  red: 'bg-gradient-to-br from-red-100 to-red-200 text-red-600',
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }) {
  const { direction } = useSettingsStore((state) => state);
  const isRTL = direction === 'rtl';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 cursor-pointer"
    >
      {isRTL ? (
        <>
          {/* In RTL: Content on right, icon on left */}
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`p-4 rounded-xl shadow-sm ${colorClasses[color]}`}
            >
              <Icon size={28} strokeWidth={2.5} />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <motion.p
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-3"
              >
                {value}
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* In LTR: Content on left, icon on right */}
          <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <motion.p
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-3"
              >
                {value}
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className={`p-4 rounded-xl shadow-sm ${colorClasses[color]}`}
            >
              <Icon size={28} strokeWidth={2.5} />
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
