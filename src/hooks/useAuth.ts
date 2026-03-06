import { useAuthContext } from '@/components/AuthProvider';

/**
 * Hook to access the global auth state and methods.
 * Now specifically uses the AuthProvider context to ensure state synchronization
 * across the entire application (prevents onboarding redirect loops).
 */
export const useAuth = () => {
  return useAuthContext();
};