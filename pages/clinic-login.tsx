import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../src/utils/api';
import useAuth from '../src/hooks/useAuth';
import { ClinicLoginCredentials, Clinic } from '../src/types/auth';

const validationSchema = Yup.object({
  clinicId: Yup.number().required('انتخاب مطب الزامی است'),
  username: Yup.string().required('نام کاربری الزامی است'),
  password: Yup.string().required('رمز عبور الزامی است')
});

const ClinicLoginPage: React.FC = () => {
  const router = useRouter();
  const { loginToClinic } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get('/api/clinics');
        setClinics(response.data.clinics || []);
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
        setError('خطا در دریافت لیست مطب‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const formik = useFormik<ClinicLoginCredentials>({
    initialValues: {
      clinicId: 0,
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await loginToClinic(values);
        
        // Redirect based on user role
        const userRole = localStorage.getItem('userRole');
        switch (userRole) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'CLINIC_MANAGER':
            router.push('/clinic-manager/dashboard');
            break;
          case 'SECRETARY':
            router.push('/secretary/dashboard');
            break;
          case 'DOCTOR':
            router.push('/doctor/dashboard');
            break;
          case 'OPTICIAN':
            router.push('/optician/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در ورود به سیستم');
      } finally {
        setSubmitting(false);
      }
    }
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            sx={{ mb: 3 }}
          >
            ورود به سیستم مطب
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {clinics.length === 0 && !loading ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              هیچ مطبی یافت نشد. لطفا با مدیر سیستم تماس بگیرید.
            </Alert>
          ) : (
            <form onSubmit={formik.handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="clinic-select-label">انتخاب مطب</InputLabel>
                <Select
                  labelId="clinic-select-label"
                  id="clinicId"
                  name="clinicId"
                  value={formik.values.clinicId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.clinicId && Boolean(formik.errors.clinicId)}
                  label="انتخاب مطب"
                >
                  <MenuItem value={0} disabled>
                    لطفا یک مطب انتخاب کنید
                  </MenuItem>
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.clinicId && formik.errors.clinicId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.clinicId}
                  </Typography>
                )}
              </FormControl>

              <TextField
                fullWidth
                id="username"
                name="username"
                label="نام کاربری"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                margin="normal"
                dir="rtl"
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="رمز عبور"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
                dir="rtl"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={formik.isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'ورود'
                )}
              </Button>
            </form>
          )}

          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Button
                variant="text"
                color="primary"
                onClick={() => router.push('/super-admin/login')}
              >
                ورود به عنوان مدیر ارشد
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ClinicLoginPage; 