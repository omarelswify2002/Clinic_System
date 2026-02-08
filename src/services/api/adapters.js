/**
 * API Adapters - Transform backend responses to frontend format
 * 
 * The backend uses a different data structure than the frontend mock data.
 * These adapters ensure compatibility.
 */

/**
 * Transform backend patient to frontend format
 */
export const adaptPatient = (backendPatient) => {
  if (!backendPatient) return null;

  // Backend uses: id, name, age, gender, phone, bloodType, nationalID, createdAt
  // Frontend expects: id, firstName, lastName, nationalId, dateOfBirth, gender, phone, email, address, bloodType
  
  const [firstName = '', ...lastNameParts] = (backendPatient.name || '').split(' ');
  const lastName = lastNameParts.join(' ') || '';

  return {
    id: String(backendPatient.id),
    firstName,
    lastName,
    age: backendPatient.age,
    nationalId: backendPatient.nationalID || '',
    dateOfBirth: backendPatient.age
      ? new Date(new Date().getFullYear() - backendPatient.age, 0, 1).toISOString()
      : new Date().toISOString(),
    gender: backendPatient.gender ? backendPatient.gender.toLowerCase() : 'male',
    phone: backendPatient.phone || '',
    email: '', // Backend doesn't have email
    address: backendPatient.address || '', // Backend has address field
    bloodType: backendPatient.bloodType || '',
    allergies: [], // Backend doesn't have allergies
    chronicDiseases: [], // Backend doesn't have chronic diseases
    createdAt: backendPatient.createdAt,
  };
};

/**
 * Transform frontend patient to backend format
 */
export const adaptPatientToBackend = (frontendPatient) => {
  const age = frontendPatient.dateOfBirth
    ? new Date().getFullYear() - new Date(frontendPatient.dateOfBirth).getFullYear()
    : null;

  // Capitalize gender to match backend validation (Male, Female, Other)
  const capitalizeGender = (gender) => {
    if (!gender) return null;
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const backendData = {
    name: `${frontendPatient.firstName} ${frontendPatient.lastName}`.trim(),
    age,
    gender: capitalizeGender(frontendPatient.gender),
    phone: frontendPatient.phone,
    bloodType: frontendPatient.bloodType || null,
    nationalID: frontendPatient.nationalId || null,
    address: frontendPatient.address || null,
  };

  console.log('Adapting patient to backend:', {
    frontend: frontendPatient,
    backend: backendData
  });

  return backendData;
};

/**
 * Transform backend visit to frontend format
 */
export const adaptVisit = (backendVisit) => {
  if (!backendVisit) return null;

  // Backend returns patient as { name, phone, age, gender }
  // We need to adapt it to frontend format
  let patient = null;
  if (backendVisit.patient) {
    const [firstName = '', lastName = ''] = backendVisit.patient.name?.split(' ') || ['', ''];
    patient = {
      id: String(backendVisit.patientId),
      firstName,
      lastName,
      phone: backendVisit.patient.phone,
      age: backendVisit.patient.age,
      gender: backendVisit.patient.gender,
    };
  }

  // Map backend status to frontend status
  // Backend: pending, in_progress, completed, cancelled
  // Frontend: scheduled, in_progress, completed, cancelled
  const statusMap = {
    'pending': 'scheduled',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };

  return {
    id: String(backendVisit.id),
    patientId: String(backendVisit.patientId),
    patient,
    doctorName: backendVisit.doctorUsername || 'Dr. Unknown',
    chiefComplaint: backendVisit.chiefComplaint || '',
    diagnosis: backendVisit.diagnosis || '',
    notes: backendVisit.notes || '',
    status: statusMap[backendVisit.status] || 'scheduled',
    visitDate: backendVisit.visitDate,
    visitType: backendVisit.visitType || backendVisit.type || 'visit',
    prescriptions: backendVisit.prescriptions?.map(adaptPrescription) || [],
  };
};

/**
 * Transform frontend visit to backend format
 */
export const adaptVisitToBackend = (frontendVisit) => {
  // Map frontend status to backend status
  // Frontend: scheduled, in_progress, completed, cancelled
  // Backend: pending, in_progress, completed, cancelled
  const statusMap = {
    'scheduled': 'pending',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };

  const backendData = {
    patientId: parseInt(frontendVisit.patientId),
    doctorUsername: frontendVisit.doctorName,
    chiefComplaint: frontendVisit.chiefComplaint,
    diagnosis: frontendVisit.diagnosis,
    notes: frontendVisit.notes,
    status: statusMap[frontendVisit.status] || 'pending',
  };
  if (frontendVisit.visitType) {
    backendData.visitType = frontendVisit.visitType;
  }
  return backendData;
};

/**
 * Transform backend prescription to frontend format
 */
export const adaptPrescription = (backendPrescription) => {
  if (!backendPrescription) return null;

  // Backend can return prescriptions in two formats:
  // 1. List view: { id, date, patientName, doctorName, medicationCount, additionalNotes }
  // 2. Detail view: { id, visitId, medications, additionalNotes, prescribedAt, visit: { patient } }

  let patient = null;

  // Handle list view format
  if (backendPrescription.patientName) {
    const [firstName = '', lastName = ''] = backendPrescription.patientName.split(' ') || ['', ''];
    patient = {
      firstName,
      lastName,
    };
  }
  // Handle detail view format
  else if (backendPrescription.visit?.patient) {
    const [firstName = '', lastName = ''] = backendPrescription.visit.patient.name?.split(' ') || ['', ''];
    patient = {
      firstName,
      lastName,
      nationalId: backendPrescription.visit.patient.nationalID || '',
      phone: backendPrescription.visit.patient.phone || '',
      age: backendPrescription.visit.patient.age,
      gender: backendPrescription.visit.patient.gender,
    };
  }

  return {
    id: String(backendPrescription.id),
    visitId: String(backendPrescription.visitId),
    patient,
    doctorName: backendPrescription.doctorName || backendPrescription.visit?.doctorUsername || 'Dr. Unknown',
    medications: backendPrescription.medications?.map(med => ({
      id: String(med.id),
      name: med.name,
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      instructions: med.instructions || '',
    })) || [],
    medicationCount: backendPrescription.medicationCount || backendPrescription.medications?.length || 0,
    additionalNotes: backendPrescription.additionalNotes || '',
    prescriptionDate: backendPrescription.date || backendPrescription.prescribedAt,
    consultationDate: backendPrescription.consultationDate || backendPrescription.appointmentDate || null,
  };
};

/**
 * Transform frontend prescription to backend format
 */
export const adaptPrescriptionToBackend = (frontendPrescription) => {
  const backendData = {
    additionalNotes: frontendPrescription.additionalNotes || null,
    medications: frontendPrescription.medications?.map(med => ({
      name: med.name,
      dosage: med.dosage || null,
      frequency: med.frequency || null,
      duration: med.duration || null,
      instructions: med.instructions || null,
    })) || [],
  };
  if (frontendPrescription.consultationDate) {
    backendData.consultationDate = frontendPrescription.consultationDate;
  }

  // Only include visitId if it exists (for create, not update)
  if (frontendPrescription.visitId) {
    backendData.visitId = parseInt(frontendPrescription.visitId);
  }

  return backendData;
};

/**
 * Transform backend queue to frontend format
 */
export const adaptQueue = (backendQueue) => {
  if (!backendQueue) return null;

  return {
    id: String(backendQueue.id),
    patientId: String(backendQueue.patientId),
    patient: backendQueue.patient ? adaptPatient(backendQueue.patient) : null,
    queueNumber: backendQueue.position,
    reason: backendQueue.reason || '',
    priority: backendQueue.priority || 'normal',
    status: backendQueue.status || 'waiting',
    queuedAt: backendQueue.queuedAt,
  };
};

/**
 * Transform frontend queue to backend format
 */
export const adaptQueueToBackend = (frontendQueue) => {
  // Backend only accepts: patientId, reason, priority
  // position and status are managed by the backend
  const backendData = {
    patientId: parseInt(frontendQueue.patientId),
    reason: frontendQueue.reason || '',
    priority: frontendQueue.priority || 'normal',
  };

  console.log('Adapting queue to backend:', {
    frontend: frontendQueue,
    backend: backendData
  });

  return backendData;
};

