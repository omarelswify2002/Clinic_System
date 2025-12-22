import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Pill,
  X
} from 'lucide-react';
import { ROUTES } from '../constants';
import { useUIStore, useAuthStore } from '../../app/store';
import { useSettingsStore } from '../../app/settingsStore';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { useTranslation } from '../i18n';

const navItems = [
  { path: ROUTES.DASHBOARD, icon: LayoutDashboard, labelKey: 'nav.dashboard', permission: null },
  { path: ROUTES.PATIENTS, icon: Users, labelKey: 'nav.patients', permission: PERMISSIONS.VIEW_PATIENTS },
  { path: ROUTES.QUEUE, icon: ClipboardList, labelKey: 'nav.queue', permission: PERMISSIONS.VIEW_QUEUE },
  { path: ROUTES.VISITS, icon: FileText, labelKey: 'nav.visits', permission: PERMISSIONS.VIEW_VISITS },
  { path: ROUTES.PRESCRIPTIONS, icon: Pill, labelKey: 'nav.prescriptions', permission: PERMISSIONS.VIEW_PRESCRIPTIONS },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const direction = useSettingsStore((state) => state.direction);
  const { t } = useTranslation();

  const isRTL = direction === 'rtl';

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter(item =>
    !item.permission || hasPermission(user, item.permission)
  );

  return (
    <>
      {/* Overlay - show when sidebar is open on small screens only */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Toggleable on all screen sizes */}
      <aside
        className={`fixed ${isRTL ? 'right-0' : 'left-0'} top-0 h-full w-64 bg-white dark:bg-gray-800 ${isRTL ? 'border-l' : 'border-r'} border-gray-200 dark:border-gray-700 z-30 flex flex-col shadow-lg transition-transform duration-300 ${
          sidebarOpen
            ? 'translate-x-0'
            : (isRTL ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">ClinicSystem</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Medical Management</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Version 1.0.0
              </div>
            </div>
      </aside>
    </>
  );
}

