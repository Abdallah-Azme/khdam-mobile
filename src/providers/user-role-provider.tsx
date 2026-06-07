import { useSession } from '@/providers/session-provider';
import type { UserRole } from '@/types/session';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

type UserRoleContextValue = {
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
};

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({ children }: PropsWithChildren) {
  const { session, setRole } = useSession();
  const value = useMemo(
    () => ({ role: session?.user.role ?? ('seeker' as const), setRole }),
    [session?.user.role, setRole],
  );
  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
}

export function useUserRole() {
  const value = useContext(UserRoleContext);
  if (!value) throw new Error('useUserRole must be used within UserRoleProvider');
  return value;
}
