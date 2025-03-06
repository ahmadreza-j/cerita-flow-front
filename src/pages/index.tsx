import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuth from '../hooks/useAuth';
import { Role } from '../types/auth';

const Home = () => {
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

  // Show nothing while redirecting
  return null;
};

export default Home; 