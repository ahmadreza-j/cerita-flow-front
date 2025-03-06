import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/auth/LoginForm';
import useAuth from '../hooks/useAuth';
import { Role } from '../types/auth';

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, login, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case Role.SECRETARY:
          router.push('/patients');
          break;
        case Role.DOCTOR:
          router.push('/visits');
          break;
        case Role.OPTICIAN:
          router.push('/glasses');
          break;
        case Role.ADMIN:
          router.push('/dashboard');
          break;
        default:
          router.push('/patients');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (values: { username: string; password: string }) => {
    await login(values.username, values.password);
  };

  // If already authenticated, show loading or nothing while redirecting
  if (isAuthenticated) {
    return null;
  }

  return <LoginForm onSubmit={handleLogin} />;
};

export default Home; 