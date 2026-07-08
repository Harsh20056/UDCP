import { useCallback } from 'react';
import { useAuth } from './useAuth.js';
import { can } from '../utils/permissions.js';

export function usePermission() {
  const { user } = useAuth();
  const check = useCallback((action, context = {}) => can(user, action, context), [user]);
  return check;
}
