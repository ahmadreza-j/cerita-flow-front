import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../src/hooks/useAuth';
import { Role } from '../src/types/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case Role.SECRETARY:
          router.push('/secretary');
          break;
        case Role.DOCTOR:
          router.push('/doctor');
          break;
        case Role.OPTICIAN:
          router.push('/optician');
          break;
        case Role.ADMIN:
          router.push('/admin');
          break;
        case Role.CLINIC_MANAGER:
          router.push('/clinic-manager');
          break;
        default:
          router.push('/login');
      }
    }
  }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      در حال بارگذاری...
    </div>
  );
} 