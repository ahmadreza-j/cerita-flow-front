import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import OpticianLayout from '../../src/components/layout/OpticianLayout';

export default function ProductManagement() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.OPTICIAN) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== Role.OPTICIAN) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <OpticianLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          مدیریت محصولات
        </Typography>
        <Typography paragraph>
          در این بخش می‌توانید محصولات را مدیریت کنید.
        </Typography>
      </Container>
    </OpticianLayout>
  );
} 