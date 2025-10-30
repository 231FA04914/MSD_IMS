import { useAuth } from "../contexts/AuthContext.jsx";

/**
 * RoleGuard component to conditionally render content based on user permissions or roles
 * @param {string|string[]} permission - Required permission(s) to view the content
 * @param {string|string[]} allowedRoles - Required role(s) to view the content
 * @param {React.ReactNode} children - Content to render if user has permission/role
 * @param {React.ReactNode} fallback - Content to render if user doesn't have permission/role
 * @param {boolean} requireAll - If true, user must have ALL permissions (default: false)
 */
const RoleGuard = ({ 
  permission, 
  allowedRoles,
  children, 
  fallback = null, 
  requireAll = false 
}) => {
  const { hasPermission, user } = useAuth();

  // Handle allowedRoles prop (role-based access)
  if (allowedRoles) {
    if (typeof allowedRoles === 'string') {
      return user?.role === allowedRoles ? children : fallback;
    }
    
    if (Array.isArray(allowedRoles)) {
      const hasRoleAccess = allowedRoles.some(role => 
        user?.role?.toLowerCase() === role.toLowerCase()
      );
      return hasRoleAccess ? children : fallback;
    }
  }

  // Handle permission prop (permission-based access)
  if (permission) {
    // Handle single permission
    if (typeof permission === 'string') {
      return hasPermission(permission) ? children : fallback;
    }

    // Handle multiple permissions
    if (Array.isArray(permission)) {
      const hasAccess = requireAll 
        ? permission.every(perm => hasPermission(perm))
        : permission.some(perm => hasPermission(perm));
      
      return hasAccess ? children : fallback;
    }
  }

  // If no permission or role specified, render children
  return children;
};

/**
 * Hook to check permissions in functional components
 */
export const usePermissions = () => {
  const { hasPermission, isAdmin, isStaff, user } = useAuth();

  const canView = (permission) => hasPermission(permission);
  const canEdit = (permission) => hasPermission(permission);
  const canDelete = (permission) => hasPermission(permission);
  const canCreate = (permission) => hasPermission(permission);

  return {
    canView,
    canEdit,
    canDelete,
    canCreate,
    hasPermission,
    isAdmin,
    isStaff,
    user
  };
};

export default RoleGuard;
