import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';
import SuperAdminLayout from '../../src/components/layout/SuperAdminLayout';
import { Clinic } from '../../src/types/auth';
import useAuth from '../../src/hooks/useAuth';

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await axios.get('/api/super-admin/clinics');
        setClinics(response.data.clinics || []);
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
        setError('خطا در دریافت اطلاعات مطب‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          داشبورد مدیر ارشد
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          خوش آمدید، {user?.firstName} {user?.lastName}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="h6" component="h2">
                مطب‌ها
              </Typography>
              <BusinessIcon color="primary" fontSize="large" />
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 2 }}>
              {clinics.length}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              تعداد کل مطب‌های ثبت شده در سیستم
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/super-admin/clinics/new')}
              >
                افزودن مطب جدید
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="h6" component="h2">
                مدیران سیستم
              </Typography>
              <SupervisorAccountIcon color="primary" fontSize="large" />
            </Box>
            <Typography variant="h3" component="p" sx={{ mb: 2 }}>
              {/* Placeholder for admin count */}
              {0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              تعداد کل مدیران سیستم
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/super-admin/users/new')}
              >
                افزودن مدیر جدید
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          آخرین مطب‌های ثبت شده
        </Typography>
        {clinics.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
            هیچ مطبی ثبت نشده است.
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {clinics.slice(0, 3).map((clinic) => (
              <Grid item xs={12} md={4} key={clinic.id}>
                <Card>
                  <CardHeader
                    title={clinic.name}
                    subheader={`تاریخ ثبت: ${new Date(clinic.createdAt).toLocaleDateString('fa-IR')}`}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {clinic.address || 'بدون آدرس'}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => router.push(`/super-admin/clinics/${clinic.id}`)}
                      >
                        مشاهده جزئیات
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard; 