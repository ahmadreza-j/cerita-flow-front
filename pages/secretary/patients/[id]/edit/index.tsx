import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SecretaryLayout from '../../../../../src/components/layout/SecretaryLayout';
import api from '../../../../../src/utils/api';

interface PatientFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
}

const PatientEditPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationSchema = Yup.object({
    nationalId: Yup.string()
      .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
      .required('کد ملی الزامی است'),
    firstName: Yup.string().required('نام الزامی است'),
    lastName: Yup.string().required('نام خانوادگی الزامی است'),
    age: Yup.number().typeError('سن باید عدد باشد').positive('سن باید مثبت باشد').nullable(),
    gender: Yup.string().nullable(),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable()
  });

  const formik = useFormik<PatientFormValues>({
    initialValues: {
      nationalId: '',
      firstName: '',
      lastName: '',
      age: '',
      gender: '',
      phone: '',
      address: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        
        // Convert age to number if provided
        const formattedValues = {
          ...values,
          age: values.age ? parseInt(values.age) : null
        };
        
        await api.put(`/api/patients/${id}`, formattedValues);
        
        setSuccess('اطلاعات بیمار با موفقیت به‌روزرسانی شد');
        
        // Navigate back to patient details after a short delay
        setTimeout(() => {
          router.push(`/secretary/patients/${id}`);
        }, 1500);
      } catch (err) {
        console.error('Error updating patient:', err);
        setError('خطا در به‌روزرسانی اطلاعات بیمار');
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/api/patients/${id}`);
        
        if (response.data) {
          const patient = response.data;
          
          formik.setValues({
            nationalId: patient.national_id || '',
            firstName: patient.first_name || '',
            lastName: patient.last_name || '',
            age: patient.age ? patient.age.toString() : '',
            gender: patient.gender || '',
            phone: patient.phone || '',
            address: patient.address || ''
          });
        } else {
          setError('اطلاعات بیمار یافت نشد');
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('خطا در دریافت اطلاعات بیمار');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <SecretaryLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </SecretaryLayout>
    );
  }

  return (
    <SecretaryLayout>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push(`/secretary/patients/${id}`)}
          sx={{ mb: 2 }}
        >
          بازگشت به پرونده بیمار
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            ویرایش اطلاعات بیمار
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
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
                  margin="normal"
                  disabled={submitting}
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
                  margin="normal"
                  disabled={submitting}
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
                  margin="normal"
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                  margin="normal"
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={formik.touched.gender && Boolean(formik.errors.gender)}
                  disabled={submitting}
                >
                  <InputLabel id="gender-label">جنسیت</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="جنسیت"
                  >
                    <MenuItem value="">انتخاب کنید</MenuItem>
                    <MenuItem value="male">مرد</MenuItem>
                    <MenuItem value="female">زن</MenuItem>
                    <MenuItem value="other">سایر</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="شماره تماس"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  margin="normal"
                  disabled={submitting}
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
                  margin="normal"
                  multiline
                  rows={3}
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={24} /> : <SaveIcon />}
                  >
                    {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </SecretaryLayout>
  );
};

export default PatientEditPage; 