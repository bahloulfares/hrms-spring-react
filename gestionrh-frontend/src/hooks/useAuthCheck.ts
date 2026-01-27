/**
 * Hook pour validation d'autorisation au niveau composant
 * À utiliser dans tous les composants protégés
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface UseAuthCheckOptions {
  requiredRoles?: string[];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

/**
 * Hook pour vérifier les permissions de l'utilisateur au niveau composant
 * @param requiredRoles - Rôles requis pour accéder à ce composant
 * @param redirectTo - URL de redirection si non autorisé (défaut: /unauthorized)
 * @param onUnauthorized - Callback personnalisé si non autorisé
 * @returns Object avec { isAuthorized, user, hasRole }
 */
export const useAuthCheck = (options: UseAuthCheckOptions = {}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { requiredRoles = [], redirectTo = '/unauthorized', onUnauthorized } = options;

  const hasRole = (roles: string[]): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(userRole => roles.includes(userRole));
  };

  const isAuthorized = !requiredRoles.length || hasRole(requiredRoles);

  useEffect(() => {
    if (!user) {
      // User not logged in
      navigate('/login');
      return;
    }

    if (!isAuthorized) {
      // User doesn't have required roles
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        navigate(redirectTo);
      }
    }
  }, [user, isAuthorized, navigate, redirectTo, onUnauthorized]);

  return {
    isAuthorized,
    user,
    hasRole,
  };
};

/**
 * Hook pour vérifier si l'utilisateur peut voir des données sensibles
 */
export const useDataAccess = () => {
  const { user } = useAuthStore();

  const canViewAllEmails = user?.roles?.some(r => ['ADMIN', 'RH', 'MANAGER'].includes(r)) ?? false;
  const canViewAllPhones = user?.roles?.some(r => ['ADMIN', 'RH', 'MANAGER'].includes(r)) ?? false;
  const canViewSalaries = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');
  const canViewAuditTrail = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');
  const canManageRoles = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');
  const canEditAllEmployees = user?.roles?.includes('ADMIN') || user?.roles?.includes('RH');

  /**
   * Vérifie si l'utilisateur peut éditer un employé spécifique
   * - ADMIN/RH: peut éditer tous
   * - MANAGER: peut éditer seulement ceux de son département
   * - EMPLOYE: ne peut pas éditer
   */
  const canEditEmployee = (employeeDept?: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes('ADMIN') || user.roles?.includes('RH')) return true;
    if (user.roles?.includes('MANAGER') && employeeDept === user.departement) return true;
    return false;
  };

  /**
   * Vérifie si l'utilisateur peut approuver les congés d'un employé
   * - ADMIN/RH: peut approuver tous
   * - MANAGER: peut approuver seulement ceux de son département
   */
  const canApproveLeaveFor = (employeeDept?: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes('ADMIN') || user.roles?.includes('RH')) return true;
    if (user.roles?.includes('MANAGER') && employeeDept === user.departement) return true;
    return false;
  };

  /**
   * Vérifie si l'utilisateur peut voir les statistiques d'un département
   */
  const canViewDepartmentStats = (deptName?: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes('ADMIN') || user.roles?.includes('RH')) return true;
    if (user.roles?.includes('MANAGER') && deptName === user.departement) return true;
    return false;
  };

  return {
    canViewAllEmails,
    canViewAllPhones,
    canViewSalaries,
    canViewAuditTrail,
    canManageRoles,
    canEditAllEmployees,
    canEditEmployee,
    canApproveLeaveFor,
    canViewDepartmentStats,
  };
};

/**
 * Hook pour déterminer quels champs afficher dans les formulaires
 */
export const useFormFieldVisibility = () => {
  const { user } = useAuthStore();

  return {
    showSalaryField: user?.roles?.includes('ADMIN') || user?.roles?.includes('RH'),
    showRolesField: user?.roles?.includes('ADMIN') || user?.roles?.includes('RH'),
    showDepartmentField: user?.roles?.includes('ADMIN') || user?.roles?.includes('RH'),
    showPhoneField: true, // Toujours affiché
    showEmailField: true, // Toujours affiché
  };
};
