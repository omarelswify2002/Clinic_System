import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ROUTES } from '../shared/constants';

// Layouts
import MainLayout from '../shared/layout/MainLayout';
import AuthLayout from '../shared/layout/AuthLayout';

// Features
import Login from '../features/auth/Login';
import Dashboard from '../features/dashboard/Dashboard';
import PatientList from '../features/patients/PatientList';
import PatientDetails from '../features/patients/PatientDetails';
import QueueManagement from '../features/queue/QueueManagement';
import VisitList from '../features/visits/VisitList';
import NewVisit from '../features/visits/NewVisit';
import VisitDetails from '../features/visits/VisitDetails';
import PrescriptionList from '../features/prescriptions/PrescriptionList';
import NewPrescription from '../features/prescriptions/NewPrescription';
import PrescriptionDetails from '../features/prescriptions/PrescriptionDetails';
import EditPrescription from '../features/prescriptions/EditPrescription';

// Protected Route Component
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: ROUTES.HOME,
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.PATIENTS,
        element: <PatientList />,
      },
      {
        path: ROUTES.PATIENT_DETAILS,
        element: <PatientDetails />,
      },
      {
        path: ROUTES.QUEUE,
        element: <QueueManagement />,
      },
      {
        path: ROUTES.VISITS,
        element: <VisitList />,
      },
      {
        path: ROUTES.VISIT_NEW,
        element: <NewVisit />,
      },
      {
        path: ROUTES.VISIT_DETAILS,
        element: <VisitDetails />,
      },
      {
        path: ROUTES.PRESCRIPTIONS,
        element: <PrescriptionList />,
      },
      {
        path: ROUTES.PRESCRIPTION_NEW,
        element: <NewPrescription />,
      },
      {
        path: ROUTES.PRESCRIPTION_EDIT,
        element: <EditPrescription />,
      },
      {
        path: ROUTES.PRESCRIPTION_DETAILS,
        element: <PrescriptionDetails />,
      },
    ],
  },
]);

