import React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface LoginFormProps {
  onSubmit: (values: { username: string; password: string }) => Promise<void>;
}

const validationSchema = Yup.object({
  username: Yup.string()
    .required('نام کاربری الزامی است'),
  password: Yup.string()
    .required('رمز عبور الزامی است')
    .min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
});

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await onSubmit(values);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در ورود به سیستم');
      }
    },
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            ورود به سیستم
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              margin="normal"
              label="نام کاربری"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />

            <TextField
              margin="normal"
              label="رمز عبور"
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 3 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm; 