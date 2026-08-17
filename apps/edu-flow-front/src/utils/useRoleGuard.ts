import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const useRoleGuard = (
  allowedRoles: string[],
  fallbackRoute: string = '/',
) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If we have session loaded but role doesn't match
    if (status === 'authenticated' && session?.user) {
      if (!allowedRoles.includes((session.user as any).role)) {
        router.push(fallbackRoute);
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, allowedRoles, fallbackRoute, router]);

  const role = session?.user ? (session.user as any).role : null;

  return {
    session: session,
    status,
    isAllowed: role ? allowedRoles.includes(role) : false,
  };
};
