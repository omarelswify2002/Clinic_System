// import { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { ArrowLeft, Save, Search } from 'lucide-react';
// import { Card, Button, Input } from '../../shared/ui';
// import { visitApi, patientApi } from '../../services/api';
// import { useAuthStore } from '../../app/store';
// import { useTranslation } from '../../shared/i18n';
// import { useSettingsStore } from '../../app/settingsStore';

// export default function NewVisit() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const user = useAuthStore((state) => state.user);
//   const { t } = useTranslation();
//   const { direction } = useSettingsStore();
//   const isRTL = direction === 'rtl';

//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const [selectedPatient, setSelectedPatient] = useState(null);
  
//   const [formData, setFormData] = useState({
//     chiefComplaint: '',
//     diagnosis: '',
//     notes: '',
//     temperature: '',
//     bloodPressure: '',
//     heartRate: '',
//     respiratoryRate: '',
//     weight: '',
//     height: '',
//   });

//   useEffect(() => {
//     const patientId = searchParams.get('patientId');
//     if (patientId) {
//       loadPatient(patientId);
//     }
//   }, [searchParams]);

//   const loadPatient = async (nationalId) => {
//     try {
//       const patient = await patientApi.getPatientByNationalId(nationalId);
//       setSelectedPatient(patient);
//     } catch (error) {
//       console.error('Failed to load patient:', error);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;

//     try {
//       setSearching(true);
//       const results = await patientApi.searchPatients(searchQuery);
//       setSearchResults(results);
//     } catch (error) {
//       console.error('Search failed:', error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedPatient) return;

//     try {
//       setLoading(true);
//       const visitData = {
//         patientId: selectedPatient.id,
//         patient: selectedPatient,
//         doctorId: user.id,
//         doctorName: user.name,
//         chiefComplaint: formData.chiefComplaint,
//         diagnosis: formData.diagnosis,
//         notes: formData.notes,
//         vitalSigns: {
//           temperature: parseFloat(formData.temperature) || 0,
//           bloodPressure: formData.bloodPressure,
//           heartRate: parseInt(formData.heartRate) || 0,
//           respiratoryRate: parseInt(formData.respiratoryRate) || 0,
//           weight: parseFloat(formData.weight) || 0,
//           height: parseFloat(formData.height) || 0,
//         },
//       };

//       await visitApi.createVisit(visitData);
//       navigate('/visits');
//     } catch (error) {
//       console.error('Failed to create visit:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//         <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//           <Button variant="outline" onClick={() => navigate('/visits')}>
//             <ArrowLeft size={20} />
//           </Button>
//           <div className={isRTL ? 'text-right' : ''}>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('visits.newVisit')}</h1>
//             <p className="text-gray-600 dark:text-gray-300 mt-1">{t('visits.createNewVisit')}</p>
//           </div>
//         </div>
//       </div>

//       {!selectedPatient ? (
//         <Card title={t('visits.selectPatient')}>
//           <div className="space-y-4">
//             <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
//               <Input
//                 placeholder={t('patients.searchPatients')}
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
//                 className="flex-1"
//               />
//               <Button type="button" onClick={handleSearch} loading={searching}>
//                 <Search size={20} />
//               </Button>
//             </div>

//             {searchResults.length > 0 && (
//               <div className="space-y-2">
//                 {searchResults.map((patient) => (
//                   <div
//                     key={patient.id}
//                     onClick={() => setSelectedPatient(patient)}
//                     className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
//                   >
//                     <div className="font-medium text-gray-900 dark:text-white">
//                       {patient.firstName} {patient.lastName}
//                     </div>
//                     <div className="text-sm text-gray-500 dark:text-gray-400">{patient.nationalId}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Card>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <Card title={t('visits.patientInfo')}>
//             <div className={`grid grid-cols-2 gap-4 text-sm ${isRTL ? 'text-right' : ''}`}>
//               <div>
//                 <span className="text-gray-500 dark:text-gray-300">{t('patients.name')}:</span>{' '}
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {selectedPatient.firstName} {selectedPatient.lastName}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-gray-500 dark:text-gray-300">{t('patients.nationalId')}:</span>{' '}
//                 <span className="font-medium text-gray-900 dark:text-white">{selectedPatient.nationalId}</span>
//               </div>
//               <div className="col-span-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setSelectedPatient(null)}
//                 >
//                   {t('visits.changePatient')}
//                 </Button>
//               </div>
//             </div>
//           </Card>

//           <Card title={t('visits.visitDetails')}>
//             <div className="space-y-4">
//               <Input
//                 label={t('visits.chiefComplaint')}
//                 name="chiefComplaint"
//                 value={formData.chiefComplaint}
//                 onChange={handleChange}
//                 required
//                 placeholder={t('visits.chiefComplaintPlaceholder')}
//               />

//               <Input
//                 label={t('visits.diagnosis')}
//                 name="diagnosis"
//                 value={formData.diagnosis}
//                 onChange={handleChange}
//                 placeholder={t('visits.diagnosisPlaceholder')}
//               />

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                   {t('visits.notes')}
//                 </label>
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows={4}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder={t('visits.notesPlaceholder')}
//                 />
//               </div>
//             </div>
//           </Card>

//           <Card title={t('visits.vitalSigns')}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input
//                 label={t('visits.temperature')}
//                 name="temperature"
//                 type="number"
//                 step="0.1"
//                 value={formData.temperature}
//                 onChange={handleChange}
//                 placeholder="37.0"
//               />

//               <Input
//                 label={t('visits.bloodPressure')}
//                 name="bloodPressure"
//                 value={formData.bloodPressure}
//                 onChange={handleChange}
//                 placeholder="120/80"
//               />

//               <Input
//                 label={t('visits.heartRate')}
//                 name="heartRate"
//                 type="number"
//                 value={formData.heartRate}
//                 onChange={handleChange}
//                 placeholder="75"
//               />

//               <Input
//                 label={t('visits.respiratoryRate')}
//                 name="respiratoryRate"
//                 type="number"
//                 value={formData.respiratoryRate}
//                 onChange={handleChange}
//                 placeholder="16"
//               />

//               <Input
//                 label={t('visits.weight')}
//                 name="weight"
//                 type="number"
//                 step="0.1"
//                 value={formData.weight}
//                 onChange={handleChange}
//                 placeholder="70"
//               />

//               <Input
//                 label={t('visits.height')}
//                 name="height"
//                 type="number"
//                 value={formData.height}
//                 onChange={handleChange}
//                 placeholder="175"
//               />
//             </div>
//           </Card>

//           <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
//             <Button type="submit" variant="primary" loading={loading}>
//               <Save size={20} />
//               {t('visits.createVisit')}
//             </Button>
//             <Button type="button" variant="outline" onClick={() => navigate('/visits')}>
//               {t('common.cancel')}
//             </Button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }

