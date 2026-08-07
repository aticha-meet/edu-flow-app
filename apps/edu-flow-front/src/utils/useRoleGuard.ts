import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';
import { SessionType } from '@/types/session-type';

export const useRoleGuard = (
  allowedRoles: string[],
  fallbackRoute: string = '/',
) => {
  const router = useRouter();
  const session = useUserStore((state: any) => state.session);

  useEffect(() => {
    // If we have session loaded but role doesn't match
    if (session && session.role) {
      if (!allowedRoles.includes(session.role)) {
        router.push(fallbackRoute);
      }
    }
  }, [session, allowedRoles, fallbackRoute, router]);

  return {
    session,
    isAllowed: session?.role ? allowedRoles.includes(session.role) : false,
  } as {
    session: SessionType;
    isAllowed: boolean;
  };
};
