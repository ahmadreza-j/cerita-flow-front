import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import SecretaryLayout from '../../src/components/layout/SecretaryLayout';

export default function SecretaryDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.SECRETARY) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== Role.SECRETARY) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <SecretaryLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          داشبورد منشی
        </Typography>
        <Typography paragraph>
          به پنل منشی خوش آمدید.
        </Typography>
      </Container>
    </SecretaryLayout>
  );
} 