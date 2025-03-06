import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import ClinicManagerLayout from '../../src/components/layout/ClinicManagerLayout';

export default function ClinicManagerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.CLINIC_MANAGER) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== Role.CLINIC_MANAGER) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <ClinicManagerLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          داشبورد مدیر کلینیک
        </Typography>
        <Typography paragraph>
          به پنل مدیریت کلینیک خوش آمدید.
        </Typography>
      </Container>
    </ClinicManagerLayout>
  );
} 