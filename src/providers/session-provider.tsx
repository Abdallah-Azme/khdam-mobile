import { storageKeys } from '@/services/storage/keys';
import { preferenceStorage } from '@/services/storage/preference-storage';
import { secureStorage } from '@/services/storage/secure-storage';
import { sessionEvents } from '@/services/session/session-events';
import type { Session, UserRole } from '@/types/session';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type SessionContextValue = {
  isHydrating: boolean;
  session: Session | null;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [isHydrating, setIsHydrating] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const signOut = useCallback(async () => {
    await Promise.all([
      secureStorage.remove(storageKeys.token),
      preferenceStorage.remove(storageKeys.sessionUser),
    ]);
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    Promise.all([
      secureStorage.get(storageKeys.token),
      preferenceStorage.get(storageKeys.sessionUser),
    ])
      .then(([token, rawUser]) => {
        if (!active || !token || !rawUser) return;
        try {
          setSession({ token, user: JSON.parse(rawUser) });
        } catch {
          void signOut();
        }
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });

    return () => {
      active = false;
    };
  }, [signOut]);

  useEffect(() => sessionEvents.subscribe(() => void signOut()), [signOut]);

  const signIn = useCallback(async (nextSession: Session) => {
    await Promise.all([
      secureStorage.set(storageKeys.token, nextSession.token),
      preferenceStorage.set(
        storageKeys.sessionUser,
        JSON.stringify(nextSession.user),
      ),
      preferenceStorage.set(storageKeys.userRole, nextSession.user.role),
    ]);
    setSession(nextSession);
  }, []);

  const setRole = useCallback(
    async (role: UserRole) => {
      if (!session) return;
      const nextSession = {
        ...session,
        user: {
          ...session.user,
          role,
          apiUserType: role === 'office' ? ('2' as const) : ('1' as const),
        },
      };
      await Promise.all([
        preferenceStorage.set(storageKeys.userRole, role),
        preferenceStorage.set(
          storageKeys.sessionUser,
          JSON.stringify(nextSession.user),
        ),
      ]);
      setSession(nextSession);
    },
    [session],
  );

  const value = useMemo(
    () => ({ isHydrating, session, signIn, signOut, setRole }),
    [isHydrating, session, setRole, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within SessionProvider');
  return value;
}
