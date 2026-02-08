import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar } from 'lucide-react';
import { Card, Table, Pagination, Input, DatePicker, Button } from '../../shared/ui';
import { prescriptionApi, visitApi } from '../../services/api';
import { formatDate } from '../../shared/utils';
import { matchesQuery } from '../../shared/utils/search';
import { useTranslation } from '../../shared/i18n';

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Date filter
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Load prescriptions when page changes (only if not searching or filtering)
    if (!searchQuery.trim() && !selectedDate) {
      loadPrescriptions(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    // When search or date filter changes, reset to page 1
    if (searchQuery.trim() || selectedDate) {
      setCurrentPage(1);
      loadPrescriptions(1);
    } else {
      loadPrescriptions(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedDate]);

  const loadPrescriptions = async (page = 1) => {
    try {
      setLoading(true);
      // If searching or filtering by date, get all prescriptions; otherwise get paginated
      const isSearching = searchQuery.trim() || selectedDate;
      const limit = isSearching ? 999999 : 10;

      const response = await prescriptionApi.getAllPrescriptions(page, limit);
      let data = response.data;
      const allVisits = await visitApi.getAllVisits(1, 999999);
      const visitList = Array.isArray(allVisits) ? allVisits : (allVisits.data || []);
      const completedVisitIds = new Set(
        visitList.filter((v) => v.status === 'completed').map((v) => String(v.id))
      );
    

      // Apply filters if searching or filtering
      if (isSearching) {
        // Filter by date if selected
        if (selectedDate) {
          data = data.filter(p => {
            const prescriptionDate = new Date(p.prescriptionDate).toISOString().split('T')[0];
            return prescriptionDate === selectedDate;
          });
        }

        // Filter by search query if active (support multi-word queries)
        if (searchQuery.trim()) {
          data = data.filter((p) =>
            matchesQuery(
              searchQuery,
              p.patient?.firstName,
              p.patient?.lastName,
              p.doctorName,
              p.notes
            )
          );
        }
      }

      const missingPatientForCompleted = data.filter((p) =>
        completedVisitIds.has(String(p.visitId)) &&
        (!p?.patient?.firstName && !p?.patient?.lastName) &&
        p?.id
      );
      if (missingPatientForCompleted.length > 0) {
        const details = await Promise.all(
          missingPatientForCompleted.map((p) =>
            prescriptionApi.getPrescriptionById(p.id).catch(() => null)
          )
        );
        const detailMap = details.reduce((acc, detail) => {
          if (detail?.id) acc[detail.id] = detail;
          return acc;
        }, {});
        data = data.map((p) => detailMap[p.id] || p);
      }

      setPrescriptions(data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const columns = [
    {
      key: 'prescriptionDate',
      label: t('prescriptions.date'),
      render: (prescription) => formatDate(prescription.prescriptionDate, 'PPp'),
    },
    {
      key: 'patient',
      label: t('prescriptions.patient'),
      render: (prescription) =>
        `${prescription.patient?.firstName || ''} ${prescription.patient?.lastName || ''}`.trim(),
    },
    {
      key: 'doctor',
      label: t('prescriptions.doctor'),
      render: (prescription) => prescription.doctorName,
    },
    {
      key: 'medications',
      label: t('prescriptions.medications'),
      render: (prescription) => prescription.medicationCount || prescription.medications?.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('prescriptions.title')}</h1>
        <p className="text-gray-600 dark:text-gray-100 mt-1">{t('prescriptions.viewHistory')}</p>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder={t('prescriptions.searchPlaceholder') || 'Search by patient name or doctor...'}
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
                placeholder="Filter by prescription date"
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
          data={prescriptions}
          onRowClick={(prescription) => navigate(`/prescriptions/${prescription.id}`)}
          loading={loading}
        />
        
        {/* Pagination - hide when searching or filtering */}
        {!searchQuery.trim() && !selectedDate && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </Card>
    </div>
  );
}

