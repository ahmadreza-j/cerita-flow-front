import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from 'react-query';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment-jalaali';
import MainLayout from '@/components/layout/MainLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const validationSchema = Yup.object({
  patient_id: Yup.number()
    .required('انتخاب بیمار الزامی است'),
  doctor_id: Yup.number()
    .required('انتخاب پزشک الزامی است'),
  visit_time: Yup.string()
    .required('انتخاب ساعت الزامی است'),
});

const NewVisitPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get list of doctors
  const { data: doctors } = useQuery(['doctors'], async () => {
    const response = await axios.get(`${API_URL}/auth/users/doctor`);
    return response.data;
  });

  // Search patients
  const { data: patients } = useQuery(
    ['patients', searchTerm],
    async () => {
      if (searchTerm.length < 3) return [];
      const response = await axios.get(`${API_URL}/patients/search`, {
        params: { searchTerm },
      });
      return response.data;
    },
    {
      enabled: searchTerm.length >= 3,
    }
  );

  const mutation = useMutation(
    (values: any) => axios.post(`${API_URL}/visits`, {
      ...values,
      visit_date: moment().format('YYYY-MM-DD'),
    }),
    {
      onSuccess: () => {
        router.push('/visits');
      },
      onError: (error: any) => {
        setError(
          error.response?.data?.error || 'خطا در ثبت ویزیت. لطفا مجددا تلاش کنید'
        );
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      patient_id: '',
      doctor_id: '',
      visit_time: null,
    },
    validationSchema,
    onSubmit: (values) => {
      setError(null);
      mutation.mutate({
        ...values,
        visit_time: moment(values.visit_time).format('HH:mm'),
      });
    },
  });

  const handlePatientSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <MainLayout title="ثبت ویزیت جدید">
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              ثبت ویزیت جدید
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="جستجوی بیمار"
                    placeholder="جستجو بر اساس کد ملی، نام یا شماره تماس..."
                    onChange={handlePatientSearch}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.patient_id && Boolean(formik.errors.patient_id)}>
                    <InputLabel>انتخاب بیمار</InputLabel>
                    <Select
                      name="patient_id"
                      value={formik.values.patient_id}
                      onChange={formik.handleChange}
                      label="انتخاب بیمار"
                    >
                      {patients?.map((patient: any) => (
                        <MenuItem key={patient.id} value={patient.id}>
                          {`${patient.first_name} ${patient.last_name} - ${patient.national_id}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={formik.touched.doctor_id && Boolean(formik.errors.doctor_id)}>
                    <InputLabel>انتخاب پزشک</InputLabel>
                    <Select
                      name="doctor_id"
                      value={formik.values.doctor_id}
                      onChange={formik.handleChange}
                      label="انتخاب پزشک"
                    >
                      {doctors?.map((doctor: any) => (
                        <MenuItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TimePicker
                    label="ساعت ویزیت"
                    value={formik.values.visit_time}
                    onChange={(value) => formik.setFieldValue('visit_time', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.visit_time && Boolean(formik.errors.visit_time),
                        helperText: formik.touched.visit_time && formik.errors.visit_time,
                      },
                    }}
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
                      {mutation.isLoading ? 'در حال ثبت...' : 'ثبت ویزیت'}
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

export default NewVisitPage; 