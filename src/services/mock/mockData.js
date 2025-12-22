import { QUEUE_STATUS, VISIT_STATUS } from '../../shared/constants';

// Mock Users
export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Dr. Admin',
  },
  {
    id: '2',
    username: 'doctor',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Ahmed Hassan',
  },
  {
    id: '3',
    username: 'reception',
    password: 'reception123',
    role: 'reception',
    name: 'Sara Mohamed',
  },
];

// Mock Patients
export const mockPatients = [
  {
    id: '1',
    nationalId: '29012345678901',
    firstName: 'Mohamed',
    lastName: 'Ali',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    phone: '+20 100 123 4567',
    email: 'mohamed.ali@email.com',
    address: '123 Main St, Cairo',
    bloodType: 'A+',
    allergies: ['Penicillin'],
    chronicDiseases: ['Hypertension'],
    isUrgent: true, // Urgent patient
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    nationalId: '29112345678902',
    firstName: 'Fatima',
    lastName: 'Hassan',
    dateOfBirth: '1985-05-20',
    gender: 'female',
    phone: '+20 100 234 5678',
    email: 'fatima.hassan@email.com',
    address: '456 Second St, Giza',
    bloodType: 'O+',
    allergies: [],
    chronicDiseases: ['Diabetes Type 2'],
    isUrgent: false,
    createdAt: '2024-02-15T11:00:00Z',
  },
  {
    id: '3',
    nationalId: '29212345678903',
    firstName: 'Ahmed',
    lastName: 'Ibrahim',
    dateOfBirth: '1978-11-30',
    gender: 'male',
    phone: '+20 100 345 6789',
    email: 'ahmed.ibrahim@email.com',
    address: '789 Third St, Alexandria',
    bloodType: 'B+',
    allergies: ['Aspirin'],
    chronicDiseases: [],
    isUrgent: false,
    createdAt: '2024-03-20T09:00:00Z',
  },
];

// Mock Queue
export const mockQueue = [
  {
    id: '1',
    patientId: '1',
    patient: mockPatients[0],
    queueNumber: 1,
    status: QUEUE_STATUS.WAITING,
    priority: 'urgent',
    isUrgent: true,
    arrivalTime: new Date().toISOString(),
    notes: 'Urgent - High fever and chest pain',
  },
  {
    id: '2',
    patientId: '2',
    patient: mockPatients[1],
    queueNumber: 2,
    status: QUEUE_STATUS.WAITING,
    priority: 'normal',
    isUrgent: false,
    arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(),
    notes: 'Follow-up visit',
  },
];

// Mock Visits
export const mockVisits = [
  {
    id: '1',
    patientId: '1',
    patient: mockPatients[0],
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    visitDate: '2024-12-10T10:30:00Z',
    status: VISIT_STATUS.COMPLETED,
    chiefComplaint: 'Headache and fever',
    diagnosis: 'Viral infection',
    notes: 'Patient presented with headache and mild fever. Prescribed rest and fluids.',
    vitalSigns: {
      temperature: 37.8,
      bloodPressure: '120/80',
      heartRate: 75,
      respiratoryRate: 16,
      weight: 75,
      height: 175,
    },
  },
  {
    id: '2',
    patientId: '2',
    patient: mockPatients[1],
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    visitDate: '2024-12-12T14:00:00Z',
    status: VISIT_STATUS.COMPLETED,
    chiefComplaint: 'Diabetes follow-up',
    diagnosis: 'Type 2 Diabetes - controlled',
    notes: 'Blood sugar levels stable. Continue current medication.',
    vitalSigns: {
      temperature: 36.6,
      bloodPressure: '130/85',
      heartRate: 72,
      respiratoryRate: 14,
      weight: 68,
      height: 162,
    },
  },
];

// Mock Prescriptions
export const mockPrescriptions = [
  {
    id: '1',
    visitId: '1',
    patientId: '1',
    patient: mockPatients[0],
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    prescriptionDate: '2024-12-10T10:30:00Z',
    medications: [
      {
        id: '1',
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '3 days',
        instructions: 'Take after meals',
      },
    ],
    notes: 'Rest and drink plenty of fluids',
  },
  {
    id: '2',
    visitId: '2',
    patientId: '2',
    patient: mockPatients[1],
    doctorId: '2',
    doctorName: 'Dr. Ahmed Hassan',
    prescriptionDate: '2024-12-12T14:00:00Z',
    medications: [
      {
        id: '2',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        instructions: 'Take with meals',
      },
    ],
    notes: 'Continue monitoring blood sugar levels',
  },
];

