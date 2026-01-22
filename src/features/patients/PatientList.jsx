import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Card, Button, Input, Table, PermissionGuard } from '../../shared/ui';
import { patientApi } from '../../services/api';
import { formatDate, PERMISSIONS } from '../../shared/utils';
import AddPatientModal from './AddPatientModal';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [idSearch, setIdSearch] = useState(''); // Separate ID search
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    let filtered = patients;

    // Filter by ID if ID search is active
    if (idSearch.trim()) {
      const cleanId = idSearch.replace('#', '').trim();
      filtered = filtered.filter((p) => String(p.id) === cleanId);
    }

    // Filter by general search if active
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nationalId?.toLowerCase().includes(query) ||
          p.firstName?.toLowerCase().includes(query) ||
          p.lastName?.toLowerCase().includes(query) ||
          p.phone?.includes(query)
      );
    }

    setFilteredPatients(filtered);
  }, [searchQuery, idSearch, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientApi.getAllPatients();
      setPatients(data);
      setFilteredPatients(data);
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
        </div>

        <Table
          columns={columns}
          data={filteredPatients}
          onRowClick={handlePatientClick}
          loading={loading}
        />

        {!loading && filteredPatients.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-500">
            {t('patients.noPatientsFound')} "{searchQuery}"
          </div>
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

