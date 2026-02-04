import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Calendar } from 'lucide-react';
import { Card, Button, Table, Badge, Pagination, Input, DatePicker } from '../../shared/ui';
import { visitApi } from '../../services/api';
import { formatDate } from '../../shared/utils';
import { matchesQuery } from '../../shared/utils/search';
import { VISIT_STATUS } from '../../shared/constants';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';
import AddToQueueModal from '../queue/AddToQueueModal';

const statusVariants = {
  [VISIT_STATUS.SCHEDULED]: 'info',
  [VISIT_STATUS.IN_PROGRESS]: 'warning',
  [VISIT_STATUS.COMPLETED]: 'success',
  [VISIT_STATUS.CANCELLED]: 'gray',
};

export default function VisitList() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Date filter
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  const statusLabels = {
    [VISIT_STATUS.SCHEDULED]: t('visits.scheduled'),
    [VISIT_STATUS.IN_PROGRESS]: t('visits.inProgress'),
    [VISIT_STATUS.COMPLETED]: t('visits.completed'),
    [VISIT_STATUS.CANCELLED]: t('visits.cancelled'),
  };

  useEffect(() => {
    // When search or date filter changes, reset to page 1
    if (searchQuery.trim() || selectedDate) {
      setCurrentPage(1);
      loadVisits(1);
    } else {
      loadVisits(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedDate]);

  useEffect(() => {
    // Load visits when page changes (only if not searching or filtering)
    if (!searchQuery.trim() && !selectedDate) {
      loadVisits(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadVisits = async (page = 1) => {
    try {
      setLoading(true);

      // If searching or filtering by date, get all visits; otherwise get paginated
      const isSearching = searchQuery.trim() || selectedDate;
      const limit = isSearching ? 999999 : 10;

      const response = await visitApi.getAllVisits(page, limit);
      let data = response.data;

      // Apply filters if searching or filtering
      if (isSearching) {
        // Filter by date if selected
        if (selectedDate) {
          data = data.filter(v => {
            const visitDate = new Date(v.visitDate).toISOString().split('T')[0];
            return visitDate === selectedDate;
          });
        }

        // Filter by search query if active (support multi-word queries)
        if (searchQuery.trim()) {
          data = data.filter((v) =>
            matchesQuery(
              searchQuery,
              v.patient?.firstName,
              v.patient?.lastName,
              v.chiefComplaint,
              v.diagnosis
            )
          );
        }
      }

      setVisits(data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const loadQueue = async () => {
    try {
      setLoading(true);
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = () => {
    setShowAddModal(false);
    loadQueue();
    navigate('/queue');
  };

  const columns = [
    {
      key: 'visitDate',
      label: t('visits.date'),
      render: (visit) => formatDate(visit.visitDate, 'PPp'),
    },
    {
      key: 'patient',
      label: t('visits.patient'),
      render: (visit) => `${visit.patient.firstName} ${visit.patient.lastName}`,
    },
    {
      key: 'chiefComplaint',
      label: t('visits.chiefComplaint'),
    },
    {
      key: 'diagnosis',
      label: t('visits.diagnosis'),
      render: (visit) => visit.diagnosis || '-',
    },
    {
      key: 'status',
      label: t('visits.status'),
      render: (visit) => (
        <Badge variant={statusVariants[visit.status]}>
          {statusLabels[visit.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {isRTL ? (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            {t('visits.newVisit')}
          </Button>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visits.title')}</h1>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{t('visits.viewManageVisits')}</p>
          </div>
        </div>
        ) : (
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visits.title')}</h1>
              <p className="text-gray-600 dark:text-gray-100 mt-1">{t('visits.viewManageVisits')}</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              {t('visits.newVisit')}
            </Button>
          </div>
        )
      }
      
      {/* Search Bar */}
      <Card>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={t('visits.searchPlaceholder') || 'Search by patient name, complaint, or diagnosis...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 dark:text-green-400 pointer-events-none"
                size={20}
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filter by visit date"
                className="w-full pl-10 pr-4 py-2 border border-green-300 dark:border-green-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          {selectedDate && (
            <Button
              variant="secondary"
              onClick={() => setSelectedDate('')}
              className="whitespace-nowrap"
            >
              Clear Date
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={visits}
          onRowClick={(visit) => navigate(`/visits/${visit.id}`)}
          loading={loading}
        />
        {/* Pagination - hide when searching */}
        {!searchQuery.trim() && !selectedDate && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      <AddToQueueModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}

