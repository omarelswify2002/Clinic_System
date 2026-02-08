import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore, useSystemStore, useAuthStore } from '../../app/store';
import { useSettingsStore } from '../../app/settingsStore';
import { ROUTES } from '../constants';

export default function MainLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const direction = useSettingsStore((state) => state.direction);
  const initializeNetworkListeners = useSystemStore((state) => state.initializeNetworkListeners);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const isTerminal = user?.username === 'terminal' || user?.role === 'terminal';
  const isDevice = user?.username === 'device' || user?.role === 'device';
  const isWaitingRoom = location.pathname === ROUTES.WAITING_ROOM;
  const isSpecialDisplay = isTerminal || isDevice || isWaitingRoom;
  const isRTL = direction === 'rtl';

  // Initialize network status listeners
  useEffect(() => {
    const cleanup = initializeNetworkListeners();
    return cleanup;
  }, [initializeNetworkListeners]);

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden print:bg-white print:overflow-visible">
      {/* Sidebar - Hidden when printing (hidden for terminal/device users) */}
      {!isSpecialDisplay && (
        <div className="print:hidden">
          <Sidebar />
        </div>
      )}
      <div className={`flex flex-col flex-1 transition-all duration-300 print:m-0 ${
        // Apply margin when sidebar is open on all screen sizes (skip for waiting room)
        isWaitingRoom
          ? (isRTL ? 'mr-0' : 'ml-0')
          : (sidebarOpen
              ? (isRTL ? 'mr-64' : 'ml-64')
              : (isRTL ? 'mr-0' : 'ml-0'))
      }`}>
        {/* Header - Hidden when printing (hidden for terminal/device users) */}
        {!isSpecialDisplay && (
          <div className="print:hidden">
            <Header />
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-[1600px] mx-auto w-full print:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

