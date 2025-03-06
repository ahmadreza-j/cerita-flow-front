import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import DoctorLayout from '../../src/components/layout/DoctorLayout';

export default function DoctorDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.DOCTOR) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== Role.DOCTOR) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <DoctorLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          داشبورد پزشک
        </Typography>
        <Typography paragraph>
          به پنل پزشک خوش آمدید.
        </Typography>
      </Container>
    </DoctorLayout>
  );
} 