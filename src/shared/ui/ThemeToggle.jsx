import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useSettingsStore from '../../app/settingsStore.js';
import { useTranslation } from '../i18n';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore((state) => state);
  const { language } = useTranslation();
  const isDark = theme === 'dark';
  const isRTL = language === 'ar';

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle Circle */}
      <motion.div
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
        style={{ left: isRTL ? undefined : 4, right: isRTL ? 4 : undefined }}
        animate={{
          x: isRTL ? (isDark ? -32 : 0) : isDark ? 32 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Icon inside the circle */}
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 360 : 0,
            scale: isDark ? 1 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <Moon size={14} className="text-slate-700" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )}
        </motion.div>
      </motion.div>

      {/* Background Icons */}
      <div className="flex items-center justify-between px-1.5 h-full relative z-0">
        {isRTL ? (
          <>
            <Moon size={12} className="text-slate-300 opacity-70" />
            <Sun size={12} className="text-yellow-400 opacity-70" />
          </>
        ) : (
          <>
            <Sun size={12} className="text-yellow-400 opacity-70" />
            <Moon size={12} className="text-slate-300 opacity-70" />
          </>
        )}
      </div>
    </motion.button>
  );
}

