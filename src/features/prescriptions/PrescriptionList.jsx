import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table } from '../../shared/ui';
import { prescriptionApi } from '../../services/api';
import { formatDate } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await prescriptionApi.getAllPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      console.error('Failed to load prescriptions:', error);
    } finally {
      setLoading(false);
    }
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
        `${prescription.patient.firstName} ${prescription.patient.lastName}`,
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

      <Card>
        <Table
          columns={columns}
          data={prescriptions}
          onRowClick={(prescription) => navigate(`/prescriptions/${prescription.id}`)}
          loading={loading}
        />
      </Card>
    </div>
  );
}

