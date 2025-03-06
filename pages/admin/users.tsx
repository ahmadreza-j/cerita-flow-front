import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';

export default function UserManagement() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.ADMIN) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== Role.ADMIN) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          مدیریت کاربران
        </Typography>
        <Typography paragraph>
          در این بخش می‌توانید کاربران سیستم را مدیریت کنید.
        </Typography>
      </Container>
    </AdminLayout>
  );
} 