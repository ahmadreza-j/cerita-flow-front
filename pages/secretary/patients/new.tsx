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
import api from '../../../src/utils/api';
import SecretaryLayout from '../../../src/components/layout/SecretaryLayout';
import { getCurrentPersianDate } from '../../../src/utils/dateUtils';

interface PatientFormValues {
  nationalId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  occupation: string;
  address: string;
  phone: string;
  email: string;
  referralSource: string;
  chiefComplaint?: string;
}

const validationSchema = Yup.object({
  nationalId: Yup.string()
    .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد')
    .required('کد ملی الزامی است'),
  firstName: Yup.string().required('نام الزامی است'),
  lastName: Yup.string().required('نام خانوادگی الزامی است'),
  age: Yup.number()
    .typeError('سن باید عدد باشد')
    .min(0, 'سن نمی‌تواند منفی باشد')
    .required('سن الزامی است'),
  gender: Yup.string().required('جنسیت الزامی است'),
  occupation: Yup.string(),
  address: Yup.string(),
  phone: Yup.string().matches(/^[0-9]{11}$/, 'شماره تلفن باید 11 رقم باشد'),
  email: Yup.string().email('ایمیل نامعتبر است'),
  referralSource: Yup.string()
});

const NewPatientPage: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileNumber, setFileNumber] = useState<string | null>(null);

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
      email: '',
      referralSource: '',
      chiefComplaint: ''
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setError(null);
        setSuccess(null);
        
        // First, create the patient
        const patientResponse = await api.post('/api/patients', values);
        
        // Then, create a visit for the patient
        if (patientResponse.data.id) {
          const visitData = {
            patientId: patientResponse.data.id,
            chiefComplaint: values.chiefComplaint
          };
          
          await api.post('/api/visits', visitData);
          
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
      router.push(`/secretary/patients/${fileNumber}`);
    }
  };

  return (
    <SecretaryLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ثبت بیمار جدید
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          تاریخ: {getCurrentPersianDate()}
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
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                required
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
                id="email"
                name="email"
                label="ایمیل"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="chiefComplaint"
                name="chiefComplaint"
                label="شکایت اصلی"
                value={formik.values.chiefComplaint}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.chiefComplaint && Boolean(formik.errors.chiefComplaint)}
                helperText={formik.touched.chiefComplaint && formik.errors.chiefComplaint}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/secretary/patients')}
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
    </SecretaryLayout>
  );
};

export default NewPatientPage; 