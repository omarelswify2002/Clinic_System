import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar } from 'lucide-react';
import { Card, Button, Input, Table, PermissionGuard, Pagination } from '../../shared/ui';
import { patientApi, visitApi } from '../../services/api';
import { formatDate, PERMISSIONS } from '../../shared/utils';
import { matchesQuery } from '../../shared/utils/search';
import AddPatientModal from './AddPatientModal';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function PatientList() {
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [idSearch, setIdSearch] = useState(''); // Separate ID search
  const [selectedDate, setSelectedDate] = useState(''); // Date filter
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    // Load patients when page changes (only if not searching or filtering)
    if (!searchQuery.trim() && !idSearch.trim() && !selectedDate) {
      loadPatients(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    // When search or date filter changes, reset to page 1
    if (searchQuery.trim() || idSearch.trim() || selectedDate) {
      setCurrentPage(1);
      loadPatients(1);
    } else {
      loadPatients(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, idSearch, selectedDate]);

  const loadPatients = async (page = 1) => {
    try {
      setLoading(true);

      // If searching or filtering by date, get all patients; otherwise get paginated
      const isSearching = searchQuery.trim() || idSearch.trim() || selectedDate;
      const limit = isSearching ? 999999 : 10;

      const response = await patientApi.getAllPatients(page, limit);
      let data = response.data;

      // Apply filters if searching
      if (isSearching) {
        // Filter by date if selected - get patients who had visits on that date
        if (selectedDate) {
          const visitsResponse = await visitApi.getAllVisits(1, 999999);
          // Support both paginated and legacy service shapes
          const visitsData = visitsResponse.data || visitsResponse;
          const visitsOnDate = visitsData.filter(v => {
            const visitDate = new Date(v.visitDate).toISOString().split('T')[0];
            return visitDate === selectedDate;
          });
          // Normalize IDs as strings to avoid type mismatch between backend/mock
          const patientIdsWithVisits = new Set(visitsOnDate.map(v => String(v.patientId)));
          data = data.filter(p => patientIdsWithVisits.has(String(p.id)));
        }

        // Filter by ID if provided
        // - If the input is digits-only (or '#digits'), treat as exact patient.id match
        // - Otherwise, search inside nationalId (case-insensitive)
        if (idSearch.trim()) {
          const raw = idSearch.trim();
          const digitsOnly = /^#?\d+$/.test(raw);
          const digits = raw.replace(/\D/g, '');

          if (digitsOnly && digits) {
            // Exact numeric ID match only (prevents '2' matching '12')
            data = data.filter(p => String(p.id) === String(digits));
          } else {
            // Non-numeric or mixed input -> search national ID substring
            const q = raw.toLowerCase();
            data = data.filter(p => p.nationalId?.toLowerCase().includes(q));
          }
        }

        // Filter by general search if active (support multi-word queries)
        if (searchQuery.trim()) {
          data = data.filter((p) =>
            matchesQuery(
              searchQuery,
              p.id,
              p.nationalId,
              p.firstName,
              p.lastName,
              p.phone,
              p.dateOfBirth,
              p.createdAt
            )
          );
        }
      }

      setFilteredPatients(data);
      setPagination(response.pagination || { page, limit, total: data.length, totalPages: 1 });
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    navigate(`/patients/${patient.nationalId}`);
  };

  const handlePatientAdded = () => {
    setShowAddModal(false);
    loadPatients();
  };

  const columns = [
    {
      key: 'id',
      label: t('patients.id'),
      render: (patient) => `#${patient.id}`,
    },
    {
      key: 'nationalId',
      label: t('patients.nationalId'),
    },
    {
      key: 'name',
      label: t('patients.name'),
      render: (patient) => `${patient.firstName} ${patient.lastName}`,
    },
    {
      key: 'dateOfBirth',
      label: t('patients.dateOfBirth'),
      render: (patient) => formatDate(patient.dateOfBirth, 'PP'),
    },
    {
      key: 'gender',
      label: t('patients.gender'),
      render: (patient) => (
        <span className="capitalize">
          {patient.gender === 'male' ? t('patients.male') : t('patients.female')}
        </span>
      ),
    },
    {
      key: 'phone',
      label: t('patients.phone'),
    },
    {
      key: 'bloodType',
      label: t('patients.bloodType'),
    },
  ];

  return (
    <div className="space-y-6">
      {isRTL ? (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <PermissionGuard permission={PERMISSIONS.ADD_PATIENT}>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              {t('patients.addPatient')}
            </Button>
          </PermissionGuard>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('patients.patientList')}</h1>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{t('patients.patientList')}</p>
          </div>
        </div>
        ) : (
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('patients.patientList')}</h1>
            <p className="text-gray-600 dark:text-gray-100 mt-1">{t('patients.patientList')}</p>
          </div>
          <PermissionGuard permission={PERMISSIONS.ADD_PATIENT}>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              {t('patients.addPatient')}
            </Button>
          </PermissionGuard>
        </div>
      )}
      <Card>
        <div className="mb-6 space-y-4">
          {/* ID-Only Search */}
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400`}
              size={20}
            />
            <input
              type="text"
              placeholder={`${t('patients.searchById')} (#15)`}
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border-2 border-blue-300 dark:border-blue-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>

          {/* General Search */}
          <div className="relative">
            <Search
              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500`}
              size={20}
            />
            <input
              type="text"
              placeholder={`${t('patients.searchPatients')} (${t('patients.nationalId')}, ${t('patients.name')}, ${t('patients.phone')})`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
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
                  className={`w-full pl-10 pr-4 py-2 border border-green-300 dark:border-green-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
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
        </div>

        <Table
          columns={columns}
          data={filteredPatients}
          onRowClick={handlePatientClick}
          loading={loading}
        />

        {!loading && filteredPatients.length === 0 && (searchQuery || idSearch || selectedDate) && (
          <div className="text-center py-8 text-gray-500">
            {t('patients.noPatientsFound')} "{searchQuery || idSearch || selectedDate}"
          </div>
        )}

        {/* Pagination - only show when not searching or filtering */}
        {!searchQuery && !idSearch && !selectedDate && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setCurrentPage(p)}
          />
        )}
      </Card>

      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
}

