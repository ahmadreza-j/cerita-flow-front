import React, { useState, useEffect } from 'react';
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
  FormHelperText,
  Container
} from '@mui/material';
import { useRouter } from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../src/utils/api';
import SecretaryLayout from '../../src/components/layout/SecretaryLayout';
import { getCurrentPersianDate } from '../../src/utils/dateUtils';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import Link from 'next/link';

interface PatientFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  occupation: string;
  address: string;
  phone: string;
  referralSource: string;
}

const validationSchema = Yup.object({
  nationalId: Yup.string()
    .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
    .required('کد ملی الزامی است'),
  firstName: Yup.string().required('نام الزامی است'),
  lastName: Yup.string().required('نام خانوادگی الزامی است'),
  age: Yup.number()
    .typeError('سن باید عدد باشد')
    .min(0, 'سن نمی‌تواند منفی باشد'),
  gender: Yup.string(),
  occupation: Yup.string(),
  address: Yup.string(),
  phone: Yup.string().matches(/^[0-9]{11}$/, 'شماره تلفن باید 11 رقم باشد'),
  referralSource: Yup.string()
});

export default function NewPatient() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileNumber, setFileNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && ![Role.SECRETARY, Role.DOCTOR].includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const formik = useFormik<PatientFormValues>({
    initialValues: {
      nationalId: '',
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      occupation: '',
      address: '',
      phone: '',
      referralSource: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        setSuccess(null);
        
        // Prepare data for API
        const patientData = {
          national_id: values.nationalId,
          first_name: values.firstName,
          last_name: values.lastName,
          age: values.age || null,
          gender: values.gender || null,
          occupation: values.occupation || null,
          address: values.address || null,
          phone: values.phone || null,
          referral_source: values.referralSource || null
        };
        
        // Create the patient
        const patientResponse = await api.post('/api/patients', patientData);
        
        if (patientResponse.data.id) {
          setSuccess('بیمار با موفقیت ثبت شد');
          setFileNumber(patientResponse.data.fileNumber);
        }
      } catch (err: any) {
        if (err.response?.data?.message === 'این کد ملی قبلاً ثبت شده است') {
          setError('بیمار با این کد ملی قبلاً ثبت شده است. لطفاً از بخش جستجو، پرونده بیمار را پیدا کنید.');
        } else {
          setError(err.response?.data?.message || 'خطا در ثبت بیمار');
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleViewPatient = () => {
    if (fileNumber) {
      router.push(`/patients/${fileNumber}`);
    }
  };

  if (!isAuthenticated || !user || ![Role.SECRETARY, Role.DOCTOR].includes(user.role)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  // Use the appropriate layout based on user role
  const Layout = user.role === Role.SECRETARY ? SecretaryLayout : SecretaryLayout; // TODO: Replace with DoctorLayout when available

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              ثبت بیمار جدید
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              تاریخ: {getCurrentPersianDate()}
            </Typography>
          </Box>
          <Link href="/patients" passHref>
            <Button variant="outlined">
              بازگشت به لیست
            </Button>
          </Link>
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
              {fileNumber && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    شماره پرونده: {fileNumber}
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleViewPatient}
                    sx={{ mt: 1 }}
                  >
                    مشاهده پرونده بیمار
                  </Button>
                </Box>
              )}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
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
                  required
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
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
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
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
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="age"
                  name="age"
                  label="سن"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl 
                  fullWidth
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                >
                  <InputLabel id="gender-label">جنسیت</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    label="جنسیت"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="male">مرد</MenuItem>
                    <MenuItem value="female">زن</MenuItem>
                    <MenuItem value="other">سایر</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="occupation"
                  name="occupation"
                  label="شغل"
                  value={formik.values.occupation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.occupation && Boolean(formik.errors.occupation)}
                  helperText={formik.touched.occupation && formik.errors.occupation}
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
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
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="referralSource"
                  name="referralSource"
                  label="نحوه آشنایی"
                  value={formik.values.referralSource}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.referralSource && Boolean(formik.errors.referralSource)}
                  helperText={formik.touched.referralSource && formik.errors.referralSource}
                  sx={{ 
                    '& .MuiInputBase-root': { height: '56px' },
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
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
                  rows={2}
                  sx={{ 
                    '& .MuiFormHelperText-root': { marginTop: '4px' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.push('/patients')}
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
                      'ثبت بیمار'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
} 