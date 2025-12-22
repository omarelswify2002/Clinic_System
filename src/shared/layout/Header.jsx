import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore, useSystemStore, useUIStore } from '../../app/store';
import { useSettingsStore } from '../../app/settingsStore';
import { StatusIndicator, ThemeToggle, LanguageSwitcher } from '../ui';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

export default function Header() {
  const { user, logout } = useAuthStore();
  const syncStatus = useSystemStore((state) => state.syncStatus);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { direction } = useSettingsStore();
  const navigate = useNavigate();

  const isRTL = direction === 'rtl';

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Menu size={24} />
          </button>
          <StatusIndicator status={syncStatus} />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle - always in same position */}
          <ThemeToggle />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <User size={18} className="text-gray-500 dark:text-gray-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

