import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainLayout from '@/components/layout/MainLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const validationSchema = Yup.object({
  national_id: Yup.string()
    .required('کد ملی الزامی است')
    .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد'),
  first_name: Yup.string()
    .required('نام الزامی است')
    .min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  last_name: Yup.string()
    .required('نام خانوادگی الزامی است')
    .min(2, 'نام خانوادگی باید حداقل 2 کاراکتر باشد'),
  age: Yup.number()
    .min(0, 'سن نمی‌تواند منفی باشد')
    .max(120, 'سن نامعتبر است')
    .nullable(),
  phone: Yup.string()
    .matches(/^09[0-9]{9}$/, 'شماره موبایل نامعتبر است')
    .nullable(),
  occupation: Yup.string().nullable(),
  address: Yup.string().nullable(),
  referral_source: Yup.string().nullable(),
});

const NewPatientPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation(
    (values: any) => axios.post(`${API_URL}/patients`, values),
    {
      onSuccess: () => {
        router.push('/patients');
      },
      onError: (error: any) => {
        setError(
          error.response?.data?.error || 'خطا در ثبت اطلاعات. لطفا مجددا تلاش کنید'
        );
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      national_id: '',
      first_name: '',
      last_name: '',
      age: '',
      phone: '',
      occupation: '',
      address: '',
      referral_source: '',
    },
    validationSchema,
    onSubmit: (values) => {
      setError(null);
      mutation.mutate(values);
    },
  });

  return (
    <MainLayout title="ثبت بیمار جدید">
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              ثبت بیمار جدید
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="کد ملی"
                    name="national_id"
                    value={formik.values.national_id}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.national_id &&
                      Boolean(formik.errors.national_id)
                    }
                    helperText={
                      formik.touched.national_id && formik.errors.national_id
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="نام"
                    name="first_name"
                    value={formik.values.first_name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.first_name &&
                      Boolean(formik.errors.first_name)
                    }
                    helperText={
                      formik.touched.first_name && formik.errors.first_name
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="نام خانوادگی"
                    name="last_name"
                    value={formik.values.last_name}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.last_name && Boolean(formik.errors.last_name)
                    }
                    helperText={
                      formik.touched.last_name && formik.errors.last_name
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="سن"
                    name="age"
                    type="number"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    error={formik.touched.age && Boolean(formik.errors.age)}
                    helperText={formik.touched.age && formik.errors.age}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="شماره موبایل"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="شغل"
                    name="occupation"
                    value={formik.values.occupation}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="آدرس"
                    name="address"
                    multiline
                    rows={2}
                    value={formik.values.address}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="نحوه آشنایی"
                    name="referral_source"
                    value={formik.values.referral_source}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      disabled={mutation.isLoading}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={mutation.isLoading}
                    >
                      {mutation.isLoading ? 'در حال ثبت...' : 'ثبت بیمار'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default NewPatientPage; 