import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../src/hooks/useAuth';
import { SuperAdminLoginCredentials } from '../../src/types/auth';

const validationSchema = Yup.object({
  username: Yup.string().required('نام کاربری الزامی است'),
  password: Yup.string().required('رمز عبور الزامی است')
});

const SuperAdminLoginPage: React.FC = () => {
  const router = useRouter();
  const { loginAsSuperAdmin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<SuperAdminLoginCredentials>({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        await loginAsSuperAdmin(values);
        router.push('/super-admin/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در ورود به سیستم');
      } finally {
        setSubmitting(false);
      }
    }
  });

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
            ورود مدیر ارشد
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
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
        </Paper>
      </Box>
    </Container>
  );
};

export default SuperAdminLoginPage; 