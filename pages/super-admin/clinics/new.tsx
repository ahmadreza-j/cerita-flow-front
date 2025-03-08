import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../src/utils/api';
import SuperAdminLayout from '../../../src/components/layout/SuperAdminLayout';

interface ClinicFormValues {
  name: string;
  address: string;
  phone: string;
  managerName: string;
  establishmentYear: string;
  logoUrl: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('نام کلینیک الزامی است'),
  address: Yup.string(),
  phone: Yup.string().matches(/^[0-9]{11}$/, 'شماره تلفن باید 11 رقم باشد'),
  managerName: Yup.string(),
  establishmentYear: Yup.string().matches(/^[0-9]{4}$/, 'سال تاسیس باید 4 رقم باشد'),
  logoUrl: Yup.string().url('آدرس لوگو باید یک URL معتبر باشد')
});

const NewClinicPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik<ClinicFormValues>({
    initialValues: {
      name: '',
      address: '',
      phone: '',
      managerName: '',
      establishmentYear: '',
      logoUrl: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        setSuccess(null);
        
        const response = await api.post('/api/super-admin/clinics', values);
        
        setSuccess('کلینیک با موفقیت ایجاد شد');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/super-admin/clinics');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در ایجاد کلینیک');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <SuperAdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          افزودن کلینیک جدید
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="نام کلینیک"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="managerName"
                name="managerName"
                label="نام مدیر"
                value={formik.values.managerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.managerName && Boolean(formik.errors.managerName)}
                helperText={formik.touched.managerName && formik.errors.managerName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="شماره تلفن"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="establishmentYear"
                name="establishmentYear"
                label="سال تاسیس"
                value={formik.values.establishmentYear}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.establishmentYear && Boolean(formik.errors.establishmentYear)}
                helperText={formik.touched.establishmentYear && formik.errors.establishmentYear}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                name="address"
                label="آدرس"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="logoUrl"
                name="logoUrl"
                label="آدرس لوگو (URL)"
                value={formik.values.logoUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.logoUrl && Boolean(formik.errors.logoUrl)}
                helperText={formik.touched.logoUrl && formik.errors.logoUrl}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/super-admin/clinics')}
                  sx={{ ml: 2 }}
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'ذخیره'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </SuperAdminLayout>
  );
};

export default NewClinicPage; 