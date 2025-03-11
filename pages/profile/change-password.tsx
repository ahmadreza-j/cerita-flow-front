import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Box, Typography } from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import ChangePasswordForm from '../../src/components/auth/ChangePasswordForm';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DoctorLayout from '../../src/components/layout/DoctorLayout';
import OpticianLayout from '../../src/components/layout/OpticianLayout';
import SecretaryLayout from '../../src/components/layout/SecretaryLayout';
import { Role } from '../../src/types/auth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSuccess = () => {
    // اینجا می‌توانید اقدامات بعد از تغییر موفق رمز عبور را انجام دهید
    // مثلاً نمایش پیام موفقیت یا هدایت کاربر به صفحه دیگر
  };

  if (!isAuthenticated || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  // انتخاب لایوت مناسب بر اساس نقش کاربر
  const getLayout = () => {
    switch (user.role) {
      case Role.ADMIN:
        return AdminLayout;
      case Role.DOCTOR:
        return DoctorLayout;
      case Role.OPTICIAN:
        return OpticianLayout;
      case Role.SECRETARY:
        return SecretaryLayout;
      default:
        return AdminLayout;
    }
  };

  const Layout = getLayout();

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1">
            تغییر رمز عبور
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            برای تغییر رمز عبور خود، لطفاً فرم زیر را تکمیل کنید.
          </Typography>
        </Box>
        
        <ChangePasswordForm onSuccess={handleSuccess} />
      </Container>
    </Layout>
  );
} 