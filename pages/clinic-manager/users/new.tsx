import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ClinicManagerLayout from '../../../src/components/layout/ClinicManagerLayout';
import { Role } from '../../../src/types/auth';

interface UserFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId: string;
  role: string;
  medicalLicenseNumber?: string;
}

const validationSchema = Yup.object({
  username: Yup.string().required('نام کاربری الزامی است'),
  email: Yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
  password: Yup.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد').required('رمز عبور الزامی است'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'رمز عبور و تکرار آن باید یکسان باشند')
    .required('تکرار رمز عبور الزامی است'),
  firstName: Yup.string().required('نام الزامی است'),
  lastName: Yup.string().required('نام خانوادگی الزامی است'),
  phoneNumber: Yup.string().matches(/^[0-9]{11}$/, 'شماره تلفن باید 11 رقم باشد'),
  nationalId: Yup.string().matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد'),
  role: Yup.string().required('نقش کاربری الزامی است'),
  medicalLicenseNumber: Yup.string().when('role', {
    is: Role.DOCTOR,
    then: Yup.string().required('شماره نظام پزشکی برای دکتر الزامی است')
  })
});

const NewUserPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik<UserFormValues>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      nationalId: '',
      role: '',
      medicalLicenseNumber: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        setSuccess(null);
        
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...userData } = values;
        
        const response = await axios.post('/api/users', userData);
        
        setSuccess('کاربر با موفقیت ایجاد شد');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/clinic-manager/users');
        }, 2000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'خطا در ایجاد کاربر');
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <ClinicManagerLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          افزودن کاربر جدید
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
                id="username"
                name="username"
                label="نام کاربری"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="ایمیل"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="تکرار رمز عبور"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="نام"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="نام خانوادگی"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="شماره تلفن"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="nationalId"
                name="nationalId"
                label="کد ملی"
                value={formik.values.nationalId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nationalId && Boolean(formik.errors.nationalId)}
                helperText={formik.touched.nationalId && formik.errors.nationalId}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth
                error={formik.touched.role && Boolean(formik.errors.role)}
                required
              >
                <InputLabel id="role-label">نقش کاربری</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formik.values.role}
                  label="نقش کاربری"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value={Role.SECRETARY}>منشی</MenuItem>
                  <MenuItem value={Role.DOCTOR}>دکتر</MenuItem>
                  <MenuItem value={Role.OPTICIAN}>عینک‌ساز</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>{formik.errors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {formik.values.role === Role.DOCTOR && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="medicalLicenseNumber"
                  name="medicalLicenseNumber"
                  label="شماره نظام پزشکی"
                  value={formik.values.medicalLicenseNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.medicalLicenseNumber && Boolean(formik.errors.medicalLicenseNumber)}
                  helperText={formik.touched.medicalLicenseNumber && formik.errors.medicalLicenseNumber}
                  required
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/clinic-manager/users')}
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
    </ClinicManagerLayout>
  );
};

export default NewUserPage; 