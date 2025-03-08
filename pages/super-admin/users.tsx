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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  Grid,
  Autocomplete
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Refresh as RefreshIcon, Person as PersonIcon, SupervisorAccount as ManagerIcon } from '@mui/icons-material';
import SuperAdminLayout from '../../src/components/layout/SuperAdminLayout';
import useAuth from '../../src/hooks/useAuth';
import api from '../../src/utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Interface for user data
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'clinic-manager' | 'doctor' | 'secretary' | 'optician';
  clinicId?: string;
  nationalId?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  address?: string;
  medicalLicenseNumber?: string; // For doctors
  createdAt: string;
  updatedAt: string;
}

interface Clinic {
  id: string;
  name: string;
  englishName: string;
  managerName?: string;
}

// Validation schema for user form
const userValidationSchema = Yup.object({
  firstName: Yup.string().required('نام الزامی است'),
  lastName: Yup.string().required('نام خانوادگی الزامی است'),
  username: Yup.string().required('نام کاربری الزامی است'),
  password: Yup.string().when(['isNew'], {
    is: (isNew: boolean) => isNew === true,
    then: (schema) => schema.required('رمز عبور الزامی است').min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
    otherwise: (schema) => schema.min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد')
  }),
  email: Yup.string().email('ایمیل معتبر نیست').required('ایمیل الزامی است'),
  phoneNumber: Yup.string(),
  role: Yup.string().oneOf(
    ['admin', 'clinic-manager', 'doctor', 'secretary', 'optician'], 
    'نقش نامعتبر است'
  ).required('نقش الزامی است'),
  clinicId: Yup.string().when(['role'], {
    is: (role: string) => role !== 'admin',
    then: (schema) => schema.required('انتخاب کلینیک الزامی است'),
    otherwise: (schema) => schema.optional()
  }),
  nationalId: Yup.string(),
  gender: Yup.string().oneOf(['male', 'female', 'other'], 'جنسیت نامعتبر است'),
  age: Yup.number().min(18, 'سن باید حداقل 18 سال باشد'),
  address: Yup.string(),
  medicalLicenseNumber: Yup.string().when(['role'], {
    is: (role: string) => role === 'doctor',
    then: (schema) => schema.required('شماره نظام پزشکی برای دکتر الزامی است'),
    otherwise: (schema) => schema.optional()
  })
});

const UsersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'managers' | 'staff'>('managers');

  // Filter users based on selected clinic and view mode
  const filteredUsers = users.filter(user => {
    if (viewMode === 'managers') {
      return user.role === 'clinic-manager';
    } else {
      return user.role !== 'admin' && user.role !== 'clinic-manager' && 
             (selectedClinic ? user.clinicId === selectedClinic : true);
    }
  });

  // Group users by clinic
  const usersByClinic = filteredUsers.reduce((acc, user) => {
    const clinicId = user.clinicId || 'no-clinic';
    if (!acc[clinicId]) {
      acc[clinicId] = [];
    }
    acc[clinicId].push(user);
    return acc;
  }, {} as Record<string, User[]>);

  // Formik for user form
  const formik = useFormik({
    initialValues: {
      id: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      email: '',
      phoneNumber: '',
      role: 'clinic-manager' as 'admin' | 'clinic-manager' | 'doctor' | 'secretary' | 'optician',
      clinicId: '',
      nationalId: '',
      gender: '' as 'male' | 'female' | 'other' | '',
      age: '',
      address: '',
      medicalLicenseNumber: '',
      isNew: true
    },
    validationSchema: userValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const userData = { ...values };
        delete userData.isNew;

        if (dialogMode === 'add') {
          await api.post('/api/super-admin/users', userData);
          setMessage({ type: 'success', text: 'کاربر با موفقیت اضافه شد' });
        } else {
          const userId = userData.id;
          delete userData.id;
          // Don't update password if empty
          if (!userData.password) {
            delete userData.password;
          }
          await api.put(`/api/super-admin/users/${userId}`, userData);
          setMessage({ type: 'success', text: 'کاربر با موفقیت ویرایش شد' });
        }

        fetchUsers();
        setOpenDialog(false);
      } catch (error: any) {
        console.error('Error saving user:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'خطا در ذخیره اطلاعات کاربر' 
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'خطا در دریافت لیست کاربران' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch clinics from API
  const fetchClinics = async () => {
    try {
      const response = await api.get('/api/super-admin/clinics');
      setClinics(response.data.clinics || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchClinics();
  }, []);

  // Handle opening the add user dialog
  const handleAddUser = () => {
    formik.resetForm();
    formik.setFieldValue('role', viewMode === 'managers' ? 'clinic-manager' : 'doctor');
    formik.setFieldValue('isNew', true);
    if (selectedClinic) {
      formik.setFieldValue('clinicId', selectedClinic);
    }
    setDialogMode('add');
    setOpenDialog(true);
  };

  // Handle opening the edit user dialog
  const handleEditUser = (user: User) => {
    formik.resetForm();
    formik.setValues({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      password: '',
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      clinicId: user.clinicId || '',
      nationalId: user.nationalId || '',
      gender: user.gender || '',
      age: user.age?.toString() || '',
      address: user.address || '',
      medicalLicenseNumber: user.medicalLicenseNumber || '',
      isNew: false
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/super-admin/users/${userId}`);
      setMessage({ type: 'success', text: 'کاربر با موفقیت حذف شد' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'خطا در حذف کاربر' });
    } finally {
      setLoading(false);
    }
  };

  // Mapping role to Persian title
  const getRoleTitle = (role: string) => {
    const roles: Record<string, string> = {
      'admin': 'ادمین',
      'clinic-manager': 'مدیر کلینیک',
      'doctor': 'دکتر',
      'secretary': 'منشی',
      'optician': 'عینک ساز'
    };
    return roles[role] || role;
  };

  // Get clinic name by ID
  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic ? clinic.name : 'نامشخص';
  };

  // Render user table for a specific clinic
  const renderUserTable = (clinicId: string, users: User[]) => {
    const clinic = clinics.find(c => c.id === clinicId);
    const clinicName = clinic ? clinic.name : 'کاربران بدون کلینیک';

    return (
      <Card key={clinicId} sx={{ mb: 4 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {clinicId !== 'no-clinic' && <Chip 
                icon={<ManagerIcon />} 
                label={`مدیر: ${clinic?.managerName || 'تعیین نشده'}`} 
                color="primary" 
                variant="outlined"
                sx={{ mr: 2 }}
              />}
              <Typography variant="h6">{clinicName}</Typography>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام و نام خانوادگی</TableCell>
                  <TableCell>نام کاربری</TableCell>
                  <TableCell>ایمیل</TableCell>
                  <TableCell>شماره تماس</TableCell>
                  <TableCell>نقش</TableCell>
                  {viewMode === 'staff' && users.some(u => u.role === 'doctor') && (
                    <TableCell>شماره نظام پزشکی</TableCell>
                  )}
                  <TableCell>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || '---'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleTitle(user.role)} 
                        color={user.role === 'clinic-manager' ? 'primary' : 'default'} 
                        size="small"
                      />
                    </TableCell>
                    {viewMode === 'staff' && users.some(u => u.role === 'doctor') && (
                      <TableCell>{user.role === 'doctor' ? (user.medicalLicenseNumber || '---') : '---'}</TableCell>
                    )}
                    <TableCell>
                      <IconButton onClick={() => handleEditUser(user)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <SuperAdminLayout>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1">
              {viewMode === 'managers' ? 'مدیریت مدیران کلینیک‌ها' : 'مدیریت کارکنان کلینیک‌ها'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddUser}
              sx={{ ml: 1 }}
            >
              {viewMode === 'managers' ? 'افزودن مدیر کلینیک' : 'افزودن کارمند'}
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchUsers}
            >
              بروزرسانی
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={viewMode} 
            onChange={(e, newValue) => {
              setViewMode(newValue);
              setSelectedClinic(null);
            }}
          >
            <Tab value="managers" label="مدیران کلینیک‌ها" />
            <Tab value="staff" label="کارکنان کلینیک‌ها" />
          </Tabs>
        </Box>

        {viewMode === 'staff' && (
          <Box sx={{ mb: 3 }}>
            <Autocomplete
              options={clinics}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="فیلتر بر اساس کلینیک"
                  variant="outlined"
                />
              )}
              onChange={(e, value) => setSelectedClinic(value ? value.id : null)}
              fullWidth
            />
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredUsers.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>
              {viewMode === 'managers' 
                ? 'هیچ مدیر کلینیکی یافت نشد' 
                : (selectedClinic 
                  ? 'هیچ کارمندی برای این کلینیک یافت نشد' 
                  : 'هیچ کارمندی یافت نشد')}
            </Typography>
          </Paper>
        )}

        {!loading && filteredUsers.length > 0 && (
          <Box>
            {Object.entries(usersByClinic).map(([clinicId, users]) => 
              renderUserTable(clinicId, users)
            )}
          </Box>
        )}

        {/* User Form Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {dialogMode === 'add' 
                ? (viewMode === 'managers' ? 'افزودن مدیر کلینیک جدید' : 'افزودن کارمند جدید')
                : (viewMode === 'managers' ? 'ویرایش مدیر کلینیک' : 'ویرایش کارمند')}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
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
                />
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
                />
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
                />
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label={dialogMode === 'add' ? 'رمز عبور' : 'رمز عبور جدید (خالی برای عدم تغییر)'}
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="ایمیل"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
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
                {viewMode === 'staff' && (
                  <FormControl fullWidth>
                    <InputLabel id="role-label">نقش</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.role && Boolean(formik.errors.role)}
                      label="نقش"
                    >
                      <MenuItem value="doctor">دکتر</MenuItem>
                      <MenuItem value="secretary">منشی</MenuItem>
                      <MenuItem value="optician">عینک ساز</MenuItem>
                    </Select>
                    {formik.touched.role && formik.errors.role && (
                      <FormHelperText error>{formik.errors.role}</FormHelperText>
                    )}
                  </FormControl>
                )}
                {viewMode === 'managers' && (
                  <input type="hidden" name="role" value="clinic-manager" />
                )}
                <FormControl fullWidth>
                  <InputLabel id="clinic-label">کلینیک</InputLabel>
                  <Select
                    labelId="clinic-label"
                    id="clinicId"
                    name="clinicId"
                    value={formik.values.clinicId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.clinicId && Boolean(formik.errors.clinicId)}
                    label="کلینیک"
                  >
                    {clinics.map(clinic => (
                      <MenuItem key={clinic.id} value={clinic.id}>{clinic.name}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.clinicId && formik.errors.clinicId && (
                    <FormHelperText error>{formik.errors.clinicId}</FormHelperText>
                  )}
                </FormControl>
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
                <FormControl fullWidth>
                  <InputLabel id="gender-label">جنسیت</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    label="جنسیت"
                  >
                    <MenuItem value="male">مرد</MenuItem>
                    <MenuItem value="female">زن</MenuItem>
                    <MenuItem value="other">سایر</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText error>{formik.errors.gender}</FormHelperText>
                  )}
                </FormControl>
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
                />
                {formik.values.role === 'doctor' && (
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
                  />
                )}
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

export default UsersPage; 