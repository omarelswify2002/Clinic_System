import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import useSettingsStore from '../../app/settingsStore';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useSettingsStore();
  const isArabic = language === 'ar';

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Switch language"
    >
      {/* Icon with rotation animation */}
      <motion.div
        animate={{ rotate: isArabic ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Languages size={18} className="text-blue-600 dark:text-blue-400" />
      </motion.div>

      {/* Language Text */}
      <div className="flex items-center gap-1.5">
        <motion.span
          key={language}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {isArabic ? 'العربية' : 'English'}
        </motion.span>
      </div>

      {/* Animated indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

