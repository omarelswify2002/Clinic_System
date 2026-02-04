// import { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { Card, Button, Input } from '../../shared/ui';
// import { prescriptionApi, patientApi, visitApi } from '../../services/api';
// import { useAuthStore } from '../../app/store';
// import { useTranslation } from '../../shared/i18n';
// import { useSettingsStore } from '../../app/settingsStore';

// export default function NewPrescription() {
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
//   const [medications, setMedications] = useState([
//     {
//       id: `temp-${Date.now()}`,
//       name: '',
//       dosage: '',
//       frequency: '',
//       duration: '',
//       instructions: '',
//     },
//   ]);
//   const [notes, setNotes] = useState('');

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

//   const addMedication = () => {
//     setMedications([
//       ...medications,
//       {
//         id: `temp-${Date.now()}`,
//         name: '',
//         dosage: '',
//         frequency: '',
//         duration: '',
//         instructions: '',
//       },
//     ]);
//   };

//   const removeMedication = (index) => {
//     setMedications(medications.filter((_, i) => i !== index));
//   };

//   const updateMedication = (index, field, value) => {
//     const updated = [...medications];
//     updated[index] = { ...updated[index], [field]: value };
//     setMedications(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedPatient) return;

//     try {
//       setLoading(true);

//       // First, create a visit for this prescription
//       const visitData = {
//         patientId: selectedPatient.id,
//         doctorName: user.name,
//         chiefComplaint: 'Prescription visit',
//         diagnosis: '',
//         notes: notes,
//         status: 'completed', // Mark as completed since we're just creating a prescription
//       };

//       const visit = await visitApi.createVisit(visitData);

//       // Then create the prescription linked to this visit
//       const prescriptionData = {
//         visitId: visit.id,
//         patientId: selectedPatient.id,
//         patient: selectedPatient,
//         doctorId: user.id,
//         doctorName: user.name,
//         medications: medications.filter(med => med.name.trim() !== ''),
//         additionalNotes: notes,
//       };

//       await prescriptionApi.createPrescription(prescriptionData);
//       navigate(`/patients/${selectedPatient.nationalId}`);
//     } catch (error) {
//       console.error('Failed to create prescription:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//         <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//           <Button variant="outline" onClick={() => navigate('/prescriptions')}>
//             <ArrowLeft size={20} />
//           </Button>
//           <div className={isRTL ? 'text-right' : ''}>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('prescriptions.newPrescription')}</h1>
//             <p className="text-gray-600 dark:text-gray-300 mt-1">{t('prescriptions.createNewPrescription')}</p>
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
//           <Card title={t('prescriptions.patientInfo')}>
//             <div className={`grid grid-cols-2 gap-4 text-sm ${isRTL ? 'text-right' : ''}`}>
//               <div>
//                 <span className="text-gray-500 dark:text-gray-300">{t('prescriptions.name')}:</span>{' '}
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

//           <Card title={t('prescriptions.medications')}>
//             <div className="space-y-4">
//               {medications.map((med, index) => (
//                 <motion.div
//                   key={med.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
//                 >
//                   <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
//                     <h4 className="font-semibold text-gray-900 dark:text-white">
//                       {t('prescriptions.medication')} {index + 1}
//                     </h4>
//                     {medications.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={() => removeMedication(index)}
//                         className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
//                       >
//                         <Trash2 size={16} />
//                       </Button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <Input
//                       label={t('prescriptions.medicationName')}
//                       value={med.name}
//                       onChange={(e) => updateMedication(index, 'name', e.target.value)}
//                       placeholder="e.g., Amoxicillin"
//                       required
//                     />

//                     <Input
//                       label={t('prescriptions.dosage')}
//                       value={med.dosage}
//                       onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
//                       placeholder="e.g., 500mg"
//                       required
//                     />

//                     <Input
//                       label={t('prescriptions.frequency')}
//                       value={med.frequency}
//                       onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
//                       placeholder="e.g., Twice daily"
//                       required
//                     />

//                     <Input
//                       label={t('prescriptions.duration')}
//                       value={med.duration}
//                       onChange={(e) => updateMedication(index, 'duration', e.target.value)}
//                       placeholder="e.g., 7 days"
//                       required
//                     />

//                     <div className="md:col-span-2">
//                       <Input
//                         label={t('prescriptions.instructions')}
//                         value={med.instructions}
//                         onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
//                         placeholder="e.g., Take after meals"
//                       />
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}

//               <Button type="button" variant="outline" onClick={addMedication} className="w-full">
//                 <Plus size={20} />
//                 {t('prescriptions.addMedication')}
//               </Button>
//             </div>
//           </Card>

//           <Card title={t('prescriptions.additionalNotes')}>
//             <textarea
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               rows={4}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder={t('prescriptions.notesPlaceholder')}
//             />
//           </Card>

//           <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
//             <Button type="submit" variant="primary" loading={loading}>
//               <Save size={20} />
//               {t('prescriptions.createPrescription')}
//             </Button>
//             <Button type="button" variant="outline" onClick={() => navigate('/prescriptions')}>
//               {t('common.cancel')}
//             </Button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// }

