import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import SuperAdminLayout from '../../src/components/layout/SuperAdminLayout';
import useAuth from '../../src/hooks/useAuth';
import api from '../../src/utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Interface for clinic data
interface Clinic {
  id: string;
  name: string;
  englishName: string; // Used for database name
  establishmentYear?: number;
  address?: string;
  managerName?: string;
  phoneNumber?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

// Validation schema for clinic form
const clinicValidationSchema = Yup.object({
  name: Yup.string().required('نام کلینیک الزامی است'),
  englishName: Yup.string()
    .required('نام انگلیسی الزامی است')
    .matches(/^[a-zA-Z0-9_-]+$/, 'نام انگلیسی فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و آندرلاین باشد'),
  establishmentYear: Yup.number()
    .min(1300, 'سال تاسیس باید بعد از 1300 باشد')
    .max(new Date().getFullYear(), 'سال تاسیس نمی‌تواند از سال جاری بیشتر باشد'),
  address: Yup.string(),
  managerName: Yup.string(),
  phoneNumber: Yup.string(),
  logo: Yup.string().url('آدرس لوگو معتبر نیست')
});

const ClinicsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Formik for clinic form
  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      englishName: '',
      establishmentYear: '',
      address: '',
      managerName: '',
      phoneNumber: '',
      logo: ''
    },
    validationSchema: clinicValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const clinicData = { ...values };
        
        // Convert empty strings to undefined
        Object.keys(clinicData).forEach(key => {
          if (clinicData[key] === '') {
            clinicData[key] = undefined;
          }
        });

        if (dialogMode === 'add') {
          await api.post('/api/super-admin/clinics', clinicData);
          setMessage({ type: 'success', text: 'کلینیک با موفقیت اضافه شد' });
        } else {
          const clinicId = clinicData.id;
          delete clinicData.id;
          await api.put(`/api/super-admin/clinics/${clinicId}`, clinicData);
          setMessage({ type: 'success', text: 'کلینیک با موفقیت ویرایش شد' });
        }

        fetchClinics();
        setOpenDialog(false);
      } catch (error: any) {
        console.error('Error saving clinic:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'خطا در ذخیره اطلاعات کلینیک' 
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Map API clinic data to view model format
  const mapApiClinicToViewModel = (apiClinic: any): Clinic => {
    return {
      id: apiClinic.id?.toString(),
      name: apiClinic.name || '',
      englishName: apiClinic.db_name?.replace(/^optometry_/, '') || apiClinic.englishName || '',
      establishmentYear: apiClinic.establishment_year ? Number(apiClinic.establishment_year) : undefined,
      address: apiClinic.address || undefined,
      managerName: apiClinic.manager_name || undefined,
      phoneNumber: apiClinic.phone || undefined,
      logo: apiClinic.logo_url || undefined,
      createdAt: apiClinic.created_at || apiClinic.createdAt || '',
      updatedAt: apiClinic.updated_at || apiClinic.updatedAt || ''
    };
  };

  // Fetch clinics from API
  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/clinics');
      
      // Debug: Log the raw clinic data to see the format of dates
      console.log('Raw clinic data from API:', response.data.clinics);
      
      // Map API data to view model
      const processedClinics = response.data.clinics?.map(mapApiClinicToViewModel) || [];
      
      setClinics(processedClinics);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت لیست کلینیک‌ها' });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Handle opening the add clinic dialog
  const handleAddClinic = () => {
    formik.resetForm();
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Handle opening the edit clinic dialog
  const handleEditClinic = (clinic: Clinic) => {
    formik.resetForm();
    formik.setValues({
      id: clinic.id,
      name: clinic.name,
      englishName: clinic.englishName,
      establishmentYear: clinic.establishmentYear?.toString() || '',
      address: clinic.address || '',
      managerName: clinic.managerName || '',
      phoneNumber: clinic.phoneNumber || '',
      logo: clinic.logo || ''
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle deleting a clinic
  const handleDeleteClinic = async (clinicId: string) => {
    if (!window.confirm('آیا از حذف این کلینیک اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام داده‌های مرتبط با کلینیک حذف خواهد شد.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/super-admin/clinics/${clinicId}`);
      setMessage({ type: 'success', text: 'کلینیک با موفقیت حذف شد' });
      fetchClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      setMessage({ type: 'error', text: 'خطا در حذف کلینیک' });
    } finally {
      setLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    // If no date is provided, return placeholder
    if (!dateString) return '---';
    
    try {
      // Handle Unix timestamps (numbers or strings)
      if (/^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString, 10);
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fa-IR');
        }
      }
      
      // Try standard date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fa-IR');
      }
      
      // Try MySQL format (YYYY-MM-DD HH:MM:SS)
      const mysqlMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s\d{2}:\d{2}:\d{2})?$/);
      if (mysqlMatch) {
        const [_, year, month, day] = mysqlMatch;
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fa-IR');
        }
      }
      
      // If all parsing attempts fail
      console.warn('Failed to parse date:', dateString);
      return '---';
    } catch (error) {
      console.error('Date formatting error:', error);
      return '---';
    }
  };

  return (
    <SuperAdminLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            مدیریت کلینیک‌ها
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchClinics}
              sx={{ ml: 1 }}
            >
              بروزرسانی
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddClinic}
            >
              افزودن کلینیک
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && clinics.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>کلینیکی یافت نشد</Typography>
          </Paper>
        )}

        {!loading && clinics.length > 0 && (
          <Grid container spacing={3}>
            {clinics.map((clinic) => (
              <Grid item xs={12} md={6} lg={4} key={clinic.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={clinic.logo} 
                        sx={{ width: 56, height: 56, mr: 2 }}
                        variant="rounded"
                      >
                        {clinic.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{clinic.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {clinic.englishName}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ my: 2 }}>
                      {clinic.managerName && (
                        <Typography variant="body2">
                          <strong>مدیر:</strong> {clinic.managerName}
                        </Typography>
                      )}
                      {clinic.establishmentYear && (
                        <Typography variant="body2">
                          <strong>سال تأسیس:</strong> {clinic.establishmentYear}
                        </Typography>
                      )}
                      {clinic.phoneNumber && (
                        <Typography variant="body2">
                          <strong>شماره تماس:</strong> {clinic.phoneNumber}
                        </Typography>
                      )}
                      {clinic.address && (
                        <Typography variant="body2">
                          <strong>آدرس:</strong> {clinic.address}
                        </Typography>
                      )}
                      <Typography variant="body2">
                        <strong>تاریخ ثبت:</strong> {formatDate(clinic.createdAt)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <IconButton onClick={() => handleEditClinic(clinic)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClinic(clinic.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Clinic Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {dialogMode === 'add' ? 'افزودن کلینیک جدید' : 'ویرایش کلینیک'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
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
                />
                <TextField
                  fullWidth
                  id="englishName"
                  name="englishName"
                  label="نام انگلیسی (برای نام دیتابیس)"
                  value={formik.values.englishName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.englishName && Boolean(formik.errors.englishName)}
                  helperText={formik.touched.englishName && formik.errors.englishName}
                  disabled={dialogMode === 'edit'} // Can't change database name after creation
                />
                <TextField
                  fullWidth
                  id="establishmentYear"
                  name="establishmentYear"
                  label="سال تأسیس"
                  type="number"
                  value={formik.values.establishmentYear}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.establishmentYear && Boolean(formik.errors.establishmentYear)}
                  helperText={formik.touched.establishmentYear && formik.errors.establishmentYear}
                />
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
                <TextField
                  fullWidth
                  id="phoneNumber"
                  name="phoneNumber"
                  label="شماره تماس"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                />
                <TextField
                  fullWidth
                  id="logo"
                  name="logo"
                  label="آدرس لوگو (URL)"
                  value={formik.values.logo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.logo && Boolean(formik.errors.logo)}
                  helperText={formik.touched.logo && formik.errors.logo}
                />
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
                  sx={{ gridColumn: '1 / span 2' }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>انصراف</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : 'ذخیره'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar 
          open={Boolean(message)} 
          autoHideDuration={6000} 
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {message && (
            <Alert 
              onClose={() => setMessage(null)} 
              severity={message.type} 
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          )}
        </Snackbar>
      </Box>
    </SuperAdminLayout>
  );
};

export default ClinicsPage; 