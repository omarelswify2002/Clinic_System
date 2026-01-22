import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore, useSystemStore } from '../../app/store';
import { useSettingsStore } from '../../app/settingsStore';

export default function MainLayout() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const direction = useSettingsStore((state) => state.direction);
  const initializeNetworkListeners = useSystemStore((state) => state.initializeNetworkListeners);
  const isRTL = direction === 'rtl';

  // Initialize network status listeners
  useEffect(() => {
    const cleanup = initializeNetworkListeners();
    return cleanup;
  }, [initializeNetworkListeners]);

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden print:bg-white print:overflow-visible">
      {/* Sidebar - Hidden when printing */}
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className={`flex flex-col flex-1 transition-all duration-300 print:m-0 ${
        // Apply margin when sidebar is open on all screen sizes
        sidebarOpen
          ? (isRTL ? 'mr-64' : 'ml-64')
          : (isRTL ? 'mr-0' : 'ml-0')
      }`}>
        {/* Header - Hidden when printing */}
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-[1600px] mx-auto w-full print:max-w-none">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

