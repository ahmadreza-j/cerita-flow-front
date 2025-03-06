import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../components/auth/LoginForm';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, login, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'secretary':
          router.push('/patients');
          break;
        case 'doctor':
          router.push('/visits');
          break;
        case 'optician':
          router.push('/glasses');
          break;
        case 'admin':
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