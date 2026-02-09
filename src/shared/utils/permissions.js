import { ROLES } from '../constants/roles';

// Define permissions for each role
export const PERMISSIONS = {
  // Patient permissions
  VIEW_PATIENTS: 'view_patients',
  ADD_PATIENT: 'add_patient',
  EDIT_PATIENT: 'edit_patient',
  DELETE_PATIENT: 'delete_patient',
  
  // Queue permissions
  VIEW_QUEUE: 'view_queue',
  MANAGE_QUEUE: 'manage_queue',

  // Appointment permissions
  VIEW_APPOINTMENTS: 'view_appointments',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MANAGE_CLINIC_HOURS: 'manage_clinic_hours',
  
  // Visit permissions
  VIEW_VISITS: 'view_visits',
  CREATE_VISIT: 'create_visit',
  EDIT_VISIT: 'edit_visit',
  COMPLETE_VISIT: 'complete_visit',
  
  // Prescription permissions
  VIEW_PRESCRIPTIONS: 'view_prescriptions',
  CREATE_PRESCRIPTION: 'create_prescription',
  EDIT_PRESCRIPTION: 'edit_prescription',
  
  // System permissions
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin has all permissions
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.ADD_PATIENT,
    PERMISSIONS.EDIT_PATIENT,
    PERMISSIONS.DELETE_PATIENT,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_CLINIC_HOURS,
    PERMISSIONS.VIEW_VISITS,
    PERMISSIONS.CREATE_VISIT,
    PERMISSIONS.EDIT_VISIT,
    PERMISSIONS.COMPLETE_VISIT,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.CREATE_PRESCRIPTION,
    PERMISSIONS.EDIT_PRESCRIPTION,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  [ROLES.DOCTOR]: [
    // Doctor can view and manage patients, visits, and prescriptions
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.ADD_PATIENT,
    PERMISSIONS.EDIT_PATIENT,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_VISITS,
    PERMISSIONS.CREATE_VISIT,
    PERMISSIONS.EDIT_VISIT,
    PERMISSIONS.COMPLETE_VISIT,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.CREATE_PRESCRIPTION,
    PERMISSIONS.EDIT_PRESCRIPTION,
  ],
  
  [ROLES.RECEPTION]: [
    // Reception can manage patients and queue
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.ADD_PATIENT,
    PERMISSIONS.EDIT_PATIENT,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MANAGE_CLINIC_HOURS,
    PERMISSIONS.VIEW_VISITS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
  ],
  
  [ROLES.NURSE]: [
    // Nurse can view patients, manage queue, and assist with visits
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_QUEUE,
    PERMISSIONS.MANAGE_QUEUE,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_VISITS,
    PERMISSIONS.CREATE_VISIT,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
  ],
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.role) return false;
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !user.role) return false;
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object with role property
 * @returns {string[]}
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  
  return ROLE_PERMISSIONS[user.role] || [];
};

