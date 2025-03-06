import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Button } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import SecretaryLayout from '../../src/components/layout/SecretaryLayout';
import Link from 'next/link';

export default function NewPatient() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && ![Role.SECRETARY, Role.DOCTOR].includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || ![Role.SECRETARY, Role.DOCTOR].includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  const Layout = user.role === Role.SECRETARY ? SecretaryLayout : SecretaryLayout;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            ثبت بیمار جدید
          </Typography>
          <Link href="/patients" passHref>
            <Button variant="outlined">
              بازگشت به لیست
            </Button>
          </Link>
        </Box>
        <Typography paragraph>
          در این بخش می‌توانید بیمار جدید ثبت کنید.
        </Typography>
      </Container>
    </Layout>
  );
} 