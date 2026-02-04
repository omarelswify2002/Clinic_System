import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { queueApi } from '../../services/api';
import { useSettingsStore } from '../../app/settingsStore';
import { useAuthStore } from '../../app/store';
import { io } from 'socket.io-client';
import { ThemeToggle, LanguageSwitcher } from '../../shared/ui';

export default function WaitingRoomDisplay() {
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({ total: 0, waiting: 0, inProgress: 0 });
  const scrollContainerRef = useRef(null);
  const { language } = useSettingsStore();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load queue data
  const loadQueue = async () => {
    try {
      const [queueData, statsData] = await Promise.all([
        queueApi.getTodayQueue(),
        queueApi.getQueueStats(),
      ]);
      setQueue(queueData.filter(q => q.status === 'waiting' || q.status === 'in_progress'));
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load queue:', error);
    }
  };

  // Real-time updates with Socket.io
  useEffect(() => {
    (async () => {
      await loadQueue();
    })();

    // Connect to Socket.io
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000');

    socket.on('queue:updated', () => {
      loadQueue();
    });

    socket.on('queue:added', () => {
      loadQueue();
    });

    socket.on('queue:removed', () => {
      loadQueue();
    });

    // Auto-refresh every 40 seconds as backup
    const interval = setInterval(loadQueue, 40000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || queue.length === 0) return;

    const container = scrollContainerRef.current;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Only scroll if content exceeds screen height
    if (scrollHeight <= clientHeight) return;

    let scrollPosition = 0;
    let direction = 1; // 1 = down, -1 = up
    const scrollSpeed = 0.5; // pixels per frame
    const pauseDuration = 2000; // pause at top/bottom for 2 seconds
    let isPaused = false;

    const scroll = () => {
      if (isPaused) return;

      scrollPosition += scrollSpeed * direction;

      // Reached bottom
      if (scrollPosition >= scrollHeight - clientHeight) {
        scrollPosition = scrollHeight - clientHeight;
        direction = -1;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, pauseDuration);
      }

      // Reached top
      if (scrollPosition <= 0) {
        scrollPosition = 0;
        direction = 1;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, pauseDuration);
      }

      container.scrollTop = scrollPosition;
    };

    const scrollInterval = setInterval(scroll, 16); // ~60fps

    return () => clearInterval(scrollInterval);
  }, [queue]);

  const formatTime = (date) => {
    return date.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting':
        return isRTL ? 'في الانتظار' : 'Waiting';
      case 'in_progress':
        return isRTL ? 'جاري الفحص' : 'In Progress';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen border-b-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-blue-500">
        <div className="container mx-auto px-8 py-6">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Logo and Title */}
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Activity className="text-white" size={32} />
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isRTL ? 'نظام إدارة العيادة' : 'ClinicSystem'}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {isRTL ? 'قائمة الانتظار' : 'Waiting Room'}
                </p>
              </div>
            </div>

            {/* Clock, Date, Theme, Language, and Logout */}
            <div className={`flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Clock and Date */}
              <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200 mb-2">
                  <Clock size={24} />
                  <span className="text-3xl font-bold font-mono">{formatTime(currentTime)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(currentTime)}</p>
              </div>

              <ThemeToggle />
              <LanguageSwitcher />
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
                title={isRTL ? 'تسجيل الخروج' : 'Logout'}
              >
                <LogOut size={20} />
                <span className="font-medium">{isRTL ? 'خروج' : 'Exit'}</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {/* <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm opacity-90">{isRTL ? 'إجمالي المرضى' : 'Total Patients'}</p>
                  <p className="text-4xl font-bold mt-1">{stats.total}</p>
                </div>
                <Users size={40} className="opacity-80" />
              </div>
            </div> */}

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm opacity-90">{isRTL ? 'في الانتظار' : 'Waiting'}</p>
                  <p className="text-4xl font-bold mt-1">{stats.waiting}</p>
                </div>
                <Clock size={40} className="opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm opacity-90">{isRTL ? 'جاري الفحص' : 'In Progress'}</p>
                  <p className="text-4xl font-bold mt-1">{stats.inProgress}</p>
                </div>
                <Activity size={40} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="container mx-auto px-8">
        <div
          ref={scrollContainerRef}
          className="space-y-4 overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <AnimatePresence mode="popLayout">
            {queue.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <Users size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-2xl text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لا يوجد مرضى في قائمة الانتظار' : 'No patients in the waiting room'}
                </p>
              </motion.div>
            ) : (
              queue.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: isRTL ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -100 : 100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className={`flex items-center gap-6 p-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {/* Queue Number */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-3xl font-bold text-white">
                          {patient.queueNumber}
                        </span>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {patient.patient?.firstName} {patient.patient?.lastName}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <div className={`${getStatusColor(patient.status)} px-6 py-3 rounded-full shadow-lg`}>
                        <span className="text-white font-bold text-lg">
                          {getStatusText(patient.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Indicator (Urgent) */}
                  {patient.priority === 'urgent' && (
                    <div className="bg-red-500 px-6 py-2">
                      <p className="text-white font-bold text-center">
                        {isRTL ? '⚠️ حالة عاجلة' : '⚠️ URGENT'}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-3">
        <p className="text-center text-gray-600 dark:text-gray-400">
          {isRTL ? 'يتم التحديث تلقائياً كل 40 ثوانٍ' : 'Auto-refreshing every 40 seconds'}
        </p>
      </div> */}
    </div>
  );
}

