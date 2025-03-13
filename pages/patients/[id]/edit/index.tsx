import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import SecretaryLayout from '../../../../src/components/layout/SecretaryLayout';
import DoctorLayout from '../../../../src/components/layout/DoctorLayout';
import OpticianLayout from '../../../../src/components/layout/OpticianLayout';
import api from '../../../../src/utils/api';
import useAuth from '../../../../src/hooks/useAuth';
import { Role } from '../../../../src/types/auth';

interface PatientFormData {
  fileNumber: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  address: string;
}

interface FormErrors {
  fileNumber?: string;
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  phone?: string;
  address?: string;
}

const EditPatientPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<PatientFormData>({
    fileNumber: '',
    nationalId: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    address: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/patients/${id}`);
      const patientData = response.data;
      
      setFormData({
        fileNumber: patientData.fileNumber || '',
        nationalId: patientData.nationalId || '',
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        age: patientData.age ? patientData.age.toString() : '',
        gender: patientData.gender || '',
        phone: patientData.phone || '',
        address: patientData.address || ''
      });
      
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('خطا در دریافت اطلاعات بیمار. لطفا دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field when user changes it
      if (errors[name as keyof FormErrors]) {
        setErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.fileNumber.trim()) {
      newErrors.fileNumber = 'شماره پرونده الزامی است';
    }
    
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'کد ملی الزامی است';
    } else if (!/^\d{10}$/.test(formData.nationalId.trim())) {
      newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }
    
    if (formData.age && !/^\d+$/.test(formData.age)) {
      newErrors.age = 'سن باید عدد باشد';
    }
    
    if (formData.phone && !/^0\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'شماره تماس باید ۱۱ رقم و با صفر شروع شود';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      const patientData = {
        fileNumber: formData.fileNumber.trim(),
        nationalId: formData.nationalId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null
      };
      
      await api.put(`/api/patients/${id}`, patientData);
      
      setSuccess('اطلاعات بیمار با موفقیت به‌روزرسانی شد.');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/patients/${id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('خطا در به‌روزرسانی اطلاعات بیمار. لطفا دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  // Determine which layout to use based on user role
  const getLayout = () => {
    if (!user) return SecretaryLayout;
    
    switch (user.role) {
      case Role.SECRETARY:
        return SecretaryLayout;
      case Role.DOCTOR:
        return DoctorLayout;
      case Role.OPTICIAN:
        return OpticianLayout;
      default:
        return SecretaryLayout;
    }
  };

  const Layout = getLayout();

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push(`/patients/${id}`)}
            sx={{ ml: 2 }}
          >
            بازگشت به پرونده بیمار
          </Button>
          <Typography variant="h5" component="h1">
            ویرایش اطلاعات بیمار
          </Typography>
        </Box>

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

        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="شماره پرونده"
                  name="fileNumber"
                  value={formData.fileNumber}
                  onChange={handleChange}
                  error={!!errors.fileNumber}
                  helperText={errors.fileNumber}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="کد ملی"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  error={!!errors.nationalId}
                  helperText={errors.nationalId}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="نام"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="نام خانوادگی"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  disabled={submitting}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="سن"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  disabled={submitting}
                  InputProps={{ inputProps: { min: 0, max: 120 } }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel id="gender-label">جنسیت</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={formData.gender}
                    onChange={(e: SelectChangeEvent) => {
                      setFormData(prev => ({
                        ...prev,
                        gender: e.target.value
                      }));
                      // Clear error if exists
                      if (errors.gender) {
                        setErrors(prev => ({
                          ...prev,
                          gender: undefined
                        }));
                      }
                    }}
                    label="جنسیت"
                    disabled={submitting}
                  >
                    <MenuItem value="">
                      <em>انتخاب نشده</em>
                    </MenuItem>
                    <MenuItem value="MALE">مرد</MenuItem>
                    <MenuItem value="FEMALE">زن</MenuItem>
                  </Select>
                  {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="شماره تماس"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  disabled={submitting}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="آدرس"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                  disabled={submitting}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default EditPatientPage; 