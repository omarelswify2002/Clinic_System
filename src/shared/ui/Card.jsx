import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useSettingsStore } from '../../app/settingsStore';

export default function Card({ children, className = '', title, actions, collapsible = false, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {(title || actions) && (
        isRTL ? (
          <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center ${actions ? 'justify-between' : 'justify-end'}`}>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
            <div className="flex items-center gap-2">
              {collapsible && (
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
              )}
              {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            </div>
          </div>) : (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
              {collapsible && (
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>)
        )}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

