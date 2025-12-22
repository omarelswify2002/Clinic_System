import { useAuthStore } from '../../app/store';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @param {Object} props
 * @param {string|string[]} props.permission - Single permission or array of permissions
 * @param {boolean} props.requireAll - If true, user must have all permissions. If false, user needs any permission
 * @param {React.ReactNode} props.children - Content to render if user has permission
 * @param {React.ReactNode} props.fallback - Content to render if user doesn't have permission
 */
export default function PermissionGuard({ 
  permission, 
  requireAll = false, 
  children, 
  fallback = null 
}) {
  const user = useAuthStore((state) => state.user);

  if (!permission) {
    return children;
  }

  let hasAccess = false;

  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(user, permission)
      : hasAnyPermission(user, permission);
  } else {
    hasAccess = hasPermission(user, permission);
  }

  return hasAccess ? children : fallback;
}

