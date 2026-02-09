import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Droplet, AlertCircle, FileText, Pill } from 'lucide-react';
import { Card, Button, Badge, PermissionGuard } from '../../shared/ui';
import { patientApi, visitApi, prescriptionApi } from '../../services/api';
import { formatDate, PERMISSIONS } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import { useSettingsStore } from '../../app/settingsStore';
import AddToQueueModal from '../queue/AddToQueueModal';

const mapStatusKey = (status) => (status === 'in_progress' ? 'inProgress' : status);
const getVisitTypeLabel = (visitType, t) => (
  visitType === 'consultation' ? t('visits.consultation') : t('visits.checkup')
);

export default function PatientDetails() {
  const { nationalId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [canCreateNewPrescription, setCanCreateNewPrescription] = useState(true);
  const { t } = useTranslation();
  const { direction } = useSettingsStore();
  const isRTL = direction === 'rtl';

  useEffect(() => {
    loadPatientData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const patientData = await patientApi.getPatientByNationalId(nationalId);
      console.log('patientDataaaa',patientData);
      
      setPatient(patientData);

      // Load visits using visitApi - use patient.id not nationalId
      const visitsData = await visitApi.getPatientVisits(patientData.id);
      console.log('visitsData>>>',visitsData);
      setVisits(visitsData);

      // Load prescriptions - use patient.id not nationalId
      const prescriptionsData = await prescriptionApi.getPatientPrescriptions(patientData.id);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('patients.patientNotFound')}</p>
        <Button onClick={() => navigate('/patients')} className="mt-4">
          {t('patients.backToPatients')}
        </Button>
      </div>
    );
  }
  
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

  const prescriptionByVisitId = prescriptions.reduce((acc, presc) => {
    if (presc?.visitId) {
      acc[String(presc.visitId)] = presc;
    }
    return acc;
  }, {});

  const resolveVisitType = (visit) => {
    if (visit.visitType) {
      return visit.visitType;
    }
    const related = prescriptionByVisitId[String(visit.id)];
    if (related?.consultationDate) {
      return 'consultation';
    }
    return 'examination';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/patients')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('patients.patientDetails')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <PermissionGuard permission={PERMISSIONS.CREATE_VISIT}>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              <FileText size={18} />
              {t('visits.newVisit')}
            </Button>
          </PermissionGuard>
          {/* <PermissionGuard permission={PERMISSIONS.CREATE_PRESCRIPTION}>
            <Button
              variant="success"
              onClick={() => navigate(`/prescriptions/new?patientId=${patient.nationalId}`)}
              disabled={!canCreateNewPrescription}
              title={!canCreateNewPrescription ? t('prescriptions.prescriptionCreatedRecently') : t('prescriptions.createPrescription')}
            >
              <Pill size={18} />
              {t('prescriptions.newPrescription')}
            </Button>
          </PermissionGuard> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title={t('patients.personalInfo')}>
            <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (
                  <>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.id')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.id}</div>
                  </div>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                </>) : (<>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.id')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.id}</div>
                  </div>
                </>)}
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (
                  <>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.nationalId')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.nationalId}</div>
                  </div>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                </>) : (<>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.nationalId')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.nationalId}</div>
                  </div>
                </>)}
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (
                  <>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.age')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.age}</div>
                  </div>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                </>) : (<>
                  <User size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.age')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.age}</div>
                  </div>
                </>)}
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (<>
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.dateOfBirth')}</div>
                  <div className="font-medium text-black dark:text-white">{formatDate(patient.dateOfBirth, 'PP')}</div>
                </div>
                <User size={18} className="text-gray-400 dark:text-gray-300" />
                </> ) : (<>
                <User size={18} className="text-gray-400 dark:text-gray-300" />
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.dateOfBirth')}</div>
                  <div className="font-medium text-black dark:text-white">{formatDate(patient.dateOfBirth, 'PP')}</div>
                </div>
                </>)}
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (<>
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.gender')}</div>
                  <div className="font-medium capitalize text-black dark:text-white">
                    {patient.gender === 'male' ? t('patients.male') : t('patients.female')}
                  </div>
                </div>
                <User size={18} className="text-gray-400 dark:text-gray-300" />
                </> ) : (<>
                <User size={18} className="text-gray-400 dark:text-gray-300" />
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.gender')}</div>
                  <div className="font-medium capitalize text-black dark:text-white">
                    {patient.gender === 'male' ? t('patients.male') : t('patients.female')}
                  </div>
                </div>
                </>)}
              </div>

              <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                {isRTL ? (<>
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.phone')}</div>
                  <div className="font-medium text-black dark:text-white">{patient.phone}</div>
                </div>
                <Phone size={18} className="text-gray-400 dark:text-gray-300" />
                </> ) : (<>
                <Phone size={18} className="text-gray-400 dark:text-gray-300" />
                <div className={isRTL ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.phone')}</div>
                  <div className="font-medium text-black dark:text-white">{patient.phone}</div>
                </div>
                </>)}
              </div>

              {patient.email && (
                <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                  {isRTL ? (<>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.email')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.email}</div>
                  </div>
                  <Mail size={18} className="text-gray-400 dark:text-gray-300" />
                  </>
                  ) : (<>
                  <Mail size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.email')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.email}</div>
                  </div>
                  </>)}
                </div>
              )}

              {patient.address && (
                <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                  {isRTL ? (<>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.address')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.address}</div>
                  </div>
                  <MapPin size={18} className="text-gray-400 dark:text-gray-300" />
                  </>
                  ) : (<>
                  <MapPin size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.address')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.address}</div>
                  </div>
                  </>)}
                </div>
              )}

              {patient.bloodType && (
                <div className={`flex items-center gap-3 ${isRTL ? 'justify-end' : ''}`}>
                  {isRTL ? (<>
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.bloodType')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.bloodType}</div>
                  </div>
                  <Droplet size={18} className="text-gray-400 dark:text-gray-300" />
                  </>
                  ) : (<>
                  <Droplet size={18} className="text-gray-400 dark:text-gray-300" />
                  <div className={isRTL ? 'text-right' : ''}>
                    <div className="text-sm text-gray-500 dark:text-gray-200">{t('patients.bloodType')}</div>
                    <div className="font-medium text-black dark:text-white">{patient.bloodType}</div>
                  </div>
                  </>)}
                </div>
              )}
            </div>
          </Card>

          <Card title={t('patients.medicalInfo')} className="mt-6">
            <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  {isRTL ? (<>
                  <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 ${isRTL ? 'justify-end' : ''}`}>
                    <AlertCircle size={16} />
                    {t('patients.allergies')}
                  </div>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="danger">{allergy}</Badge>
                    ))}
                  </div>
                  </>
                  ) : (<>
                  <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2 ${isRTL ? 'justify-end' : ''}`}>
                    <AlertCircle size={16} />
                    {t('patients.allergies')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="danger">{allergy}</Badge>
                    ))}
                  </div>
                  </>)}
                </div>
              )}

              {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                <div>
                  {isRTL ? (<>
                  <div className={`text-sm text-gray-500 dark:text-gray-400 mb-2 ${isRTL ? 'justify-end' : ''}`}>{t('patients.chronicDiseases')}</div>
                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                    {patient.chronicDiseases.map((disease, index) => (
                      <Badge key={index} variant="warning">{disease}</Badge>
                    ))}
                  </div>
                  </>
                  ) : (<>
                  <div className={`text-sm text-gray-500 dark:text-gray-400 mb-2 ${isRTL ? 'justify-end' : ''}`}>{t('patients.chronicDiseases')}</div>
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicDiseases.map((disease, index) => (
                      <Badge key={index} variant="warning">{disease}</Badge>
                    ))}
                  </div>
                  </>)}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title={t('patients.visitHistory')} collapsible defaultExpanded={true}>
            {visits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('patients.noVisits')}
              </div>
            ) : (
              <div className="space-y-4">
                {visits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all"
                    onClick={() => navigate(`/visits/${visit.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      {isRTL ? (
                        <>
                          {/* In RTL: Badge on right, content on left */}
                          <Badge variant={visit.status === 'completed' ? 'success' : 'info'}>
                            <span dir="auto">{t(`visits.${mapStatusKey(visit.status)}`)}</span>
                          </Badge>
                          <div className="flex-1 text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{visit.chiefComplaint}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(visit.visitDate, 'PPp')}
                            </div>
                            {visit.diagnosis && (
                              <div className="text-sm text-gray-900 dark:text-gray-100 mt-2">
                                <span className="font-semibold">{t('patients.diagnosis')}:</span> {visit.diagnosis}
                              </div>
                            )}
                            {visit.notes && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                <span className="font-medium">{t('patients.notes')}:</span> {visit.notes}
                              </div>
                            )}
                            {visit.status === 'completed' && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                <span className="font-medium">{t('visits.visitType')}:</span>{' '}
                                {getVisitTypeLabel(resolveVisitType(visit), t)}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* In LTR: Content on left, badge on right */}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{visit.chiefComplaint}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(visit.visitDate, 'PPp')}
                            </div>
                            {visit.diagnosis && (
                              <div className="text-sm text-gray-900 dark:text-gray-100 mt-2">
                                <span className="font-semibold">{t('patients.diagnosis')}:</span> {visit.diagnosis}
                              </div>
                            )}
                            {visit.notes && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                <span className="font-medium">{t('patients.notes')}:</span> {visit.notes}
                              </div>
                            )}
                            {visit.status === 'completed' && (
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                <span className="font-medium">{t('visits.visitType')}:</span>{' '}
                                {getVisitTypeLabel(resolveVisitType(visit), t)}
                              </div>
                            )}
                          </div>
                          <Badge variant={visit.status === 'completed' ? 'success' : 'info'}>
                            <span dir="auto">{t(`visits.${mapStatusKey(visit.status)}`)}</span>
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Prescriptions Section */}
          <Card
            title={t('patients.prescriptions')}
            collapsible
            defaultExpanded={true}
            // actions={
            //   <PermissionGuard permission={PERMISSIONS.CREATE_PRESCRIPTION}>
            //     <Button
            //       variant="success"
            //       size="sm"
            //       onClick={() => navigate(`/prescriptions/new?patientId=${patient.nationalId}`)}
            //       disabled={!canCreateNewPrescription}
            //       title={!canCreateNewPrescription ? t('prescriptions.prescriptionCreatedRecently') : t('prescriptions.createPrescription')}
            //     >
            //       <Pill size={16} />
            //       {t('prescriptions.newPrescription')}
            //     </Button>
            //   </PermissionGuard>
            // }
          >
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('patients.noPrescriptions')}</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all"
                    onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      {isRTL ? (
                        <>
                          {/* In RTL: Buttons on right, content on left */}
                          <div className="flex flex-col gap-2 items-start">
                            <Badge variant="info">{t('prescriptions.prescription')}</Badge>
                            <PermissionGuard permission={PERMISSIONS.EDIT_PRESCRIPTION}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/prescriptions/${prescription.id}/edit`);
                                }}
                              >
                                {t('common.edit')}
                              </Button>
                            </PermissionGuard>
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {prescription.medicationCount || prescription.medications?.length || 0} {t('prescriptions.medications')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(prescription.prescriptionDate, 'PPp')}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              <span className="font-medium">{t('prescriptions.doctor')}:</span> {prescription.doctorName}
                            </div>
                            {prescription.additionalNotes && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                {prescription.additionalNotes}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* In LTR: Content on left, buttons on right */}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {prescription.medicationCount || prescription.medications?.length || 0} {t('prescriptions.medications')}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(prescription.prescriptionDate, 'PPp')}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                              <span className="font-medium">{t('prescriptions.doctor')}:</span> {prescription.doctorName}
                            </div>
                            {prescription.additionalNotes && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                {prescription.additionalNotes}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge variant="info">{t('prescriptions.prescription')}</Badge>
                            <PermissionGuard permission={PERMISSIONS.EDIT_PRESCRIPTION}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/prescriptions/${prescription.id}/edit`);
                                }}
                              >
                                {t('common.edit')}
                              </Button>
                            </PermissionGuard>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <AddToQueueModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={handlePatientAdded}
          />
        </div>
      </div>
    </div>
  );
}

