import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import SuperAdminLayout from '../../src/components/layout/SuperAdminLayout';
import useAuth from '../../src/hooks/useAuth';
import api from '../../src/utils/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Interface for system settings
interface SystemSettings {
  siteName: string;
  siteDescription?: string;
  adminEmail: string;
  enableNotifications: boolean;
  backupFrequency: string;
  maintenanceMode: boolean;
  dateFormat: string;
}

// Interface for profile settings
interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const SystemSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // System settings validation schema
  const systemSettingsSchema = Yup.object({
    siteName: Yup.string().required('نام سایت الزامی است'),
    siteDescription: Yup.string(),
    adminEmail: Yup.string().email('ایمیل نامعتبر است').required('ایمیل مدیر الزامی است'),
    backupFrequency: Yup.string().required('تناوب پشتیبان‌گیری الزامی است'),
    dateFormat: Yup.string().required('فرمت تاریخ الزامی است')
  });

  // Profile settings validation schema
  const profileSettingsSchema = Yup.object({
    firstName: Yup.string().required('نام الزامی است'),
    lastName: Yup.string().required('نام خانوادگی الزامی است'),
    email: Yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
    currentPassword: Yup.string().test({
      name: 'requiredWithNewPassword',
      message: 'برای تغییر رمز عبور، وارد کردن رمز عبور فعلی الزامی است',
      test: function(value) {
        // If newPassword has a value, currentPassword is required
        const newPassword = this.parent.newPassword;
        if (newPassword && newPassword.length > 0) {
          return Boolean(value);
        }
        return true;
      }
    }),
    newPassword: Yup.string()
      .min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
    confirmPassword: Yup.string()
      .test({
        name: 'matchesNewPassword',
        message: 'رمز عبور با تأیید آن مطابقت ندارد',
        test: function(value) {
          return !this.parent.newPassword || this.parent.newPassword === value;
        }
      })
  });

  // System settings formik
  const systemSettingsFormik = useFormik({
    initialValues: {
      siteName: 'سیستم مدیریت کلینیک اپتومتری',
      siteDescription: 'سیستم جامع مدیریت کلینیک‌های اپتومتری',
      adminEmail: '',
      enableNotifications: true,
      backupFrequency: 'daily',
      maintenanceMode: false,
      dateFormat: 'jalali'
    },
    validationSchema: systemSettingsSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // در یک پروژه واقعی، اینجا داده‌ها به سرور ارسال می‌شوند
        // await api.post('/api/super-admin/settings/system', values);
        console.log('Saving system settings:', values);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMessage({ type: 'success', text: 'تنظیمات سیستم با موفقیت ذخیره شد' });
      } catch (error: any) {
        console.error('Error saving system settings:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'خطا در ذخیره تنظیمات سیستم' 
        });
      } finally {
        setLoading(false);
      }
    }
  });

  // Profile settings formik
  const profileSettingsFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: profileSettingsSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        // در یک پروژه واقعی، اینجا داده‌ها به سرور ارسال می‌شوند
        // await api.post('/api/super-admin/settings/profile', values);
        console.log('Saving profile settings:', values);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMessage({ type: 'success', text: 'تنظیمات پروفایل با موفقیت ذخیره شد' });
        
        // Clear password fields after successful save
        profileSettingsFormik.setFieldValue('currentPassword', '');
        profileSettingsFormik.setFieldValue('newPassword', '');
        profileSettingsFormik.setFieldValue('confirmPassword', '');
      } catch (error: any) {
        console.error('Error saving profile settings:', error);
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'خطا در ذخیره تنظیمات پروفایل' 
        });
      } finally {
        setLoading(false);
      }
    }
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // در یک پروژه واقعی، اینجا داده‌ها از سرور دریافت می‌شوند
        // const response = await api.get('/api/super-admin/settings');
        // systemSettingsFormik.setValues(response.data.systemSettings);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Set profile data from user context
        if (user) {
          profileSettingsFormik.setValues({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({ type: 'error', text: 'خطا در دریافت تنظیمات' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <SuperAdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          تنظیمات
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="تنظیمات سیستم" />
          <Tab label="پروفایل" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <form onSubmit={systemSettingsFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="siteName"
                      name="siteName"
                      label="نام سایت"
                      value={systemSettingsFormik.values.siteName}
                      onChange={systemSettingsFormik.handleChange}
                      onBlur={systemSettingsFormik.handleBlur}
                      error={systemSettingsFormik.touched.siteName && Boolean(systemSettingsFormik.errors.siteName)}
                      helperText={systemSettingsFormik.touched.siteName && systemSettingsFormik.errors.siteName}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="adminEmail"
                      name="adminEmail"
                      label="ایمیل مدیر"
                      value={systemSettingsFormik.values.adminEmail}
                      onChange={systemSettingsFormik.handleChange}
                      onBlur={systemSettingsFormik.handleBlur}
                      error={systemSettingsFormik.touched.adminEmail && Boolean(systemSettingsFormik.errors.adminEmail)}
                      helperText={systemSettingsFormik.touched.adminEmail && systemSettingsFormik.errors.adminEmail}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="siteDescription"
                      name="siteDescription"
                      label="توضیحات سایت"
                      value={systemSettingsFormik.values.siteDescription}
                      onChange={systemSettingsFormik.handleChange}
                      onBlur={systemSettingsFormik.handleBlur}
                      error={systemSettingsFormik.touched.siteDescription && Boolean(systemSettingsFormik.errors.siteDescription)}
                      helperText={systemSettingsFormik.touched.siteDescription && systemSettingsFormik.errors.siteDescription}
                      margin="normal"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      id="backupFrequency"
                      name="backupFrequency"
                      label="تناوب پشتیبان‌گیری"
                      value={systemSettingsFormik.values.backupFrequency}
                      onChange={systemSettingsFormik.handleChange}
                      onBlur={systemSettingsFormik.handleBlur}
                      error={systemSettingsFormik.touched.backupFrequency && Boolean(systemSettingsFormik.errors.backupFrequency)}
                      helperText={systemSettingsFormik.touched.backupFrequency && systemSettingsFormik.errors.backupFrequency}
                      margin="normal"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="daily">روزانه</option>
                      <option value="weekly">هفتگی</option>
                      <option value="monthly">ماهانه</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      id="dateFormat"
                      name="dateFormat"
                      label="فرمت تاریخ"
                      value={systemSettingsFormik.values.dateFormat}
                      onChange={systemSettingsFormik.handleChange}
                      onBlur={systemSettingsFormik.handleBlur}
                      error={systemSettingsFormik.touched.dateFormat && Boolean(systemSettingsFormik.errors.dateFormat)}
                      helperText={systemSettingsFormik.touched.dateFormat && systemSettingsFormik.errors.dateFormat}
                      margin="normal"
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="jalali">شمسی</option>
                      <option value="gregorian">میلادی</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettingsFormik.values.enableNotifications}
                          onChange={(e) => systemSettingsFormik.setFieldValue('enableNotifications', e.target.checked)}
                          name="enableNotifications"
                          color="primary"
                        />
                      }
                      label="فعال‌سازی اعلان‌ها"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemSettingsFormik.values.maintenanceMode}
                          onChange={(e) => systemSettingsFormik.setFieldValue('maintenanceMode', e.target.checked)}
                          name="maintenanceMode"
                          color="primary"
                        />
                      }
                      label="حالت تعمیر و نگهداری"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    ذخیره تنظیمات
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <form onSubmit={profileSettingsFormik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="نام"
                      value={profileSettingsFormik.values.firstName}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.firstName && Boolean(profileSettingsFormik.errors.firstName)}
                      helperText={profileSettingsFormik.touched.firstName && profileSettingsFormik.errors.firstName}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="نام خانوادگی"
                      value={profileSettingsFormik.values.lastName}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.lastName && Boolean(profileSettingsFormik.errors.lastName)}
                      helperText={profileSettingsFormik.touched.lastName && profileSettingsFormik.errors.lastName}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="ایمیل"
                      value={profileSettingsFormik.values.email}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.email && Boolean(profileSettingsFormik.errors.email)}
                      helperText={profileSettingsFormik.touched.email && profileSettingsFormik.errors.email}
                      margin="normal"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  تغییر رمز عبور
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="currentPassword"
                      name="currentPassword"
                      label="رمز عبور فعلی"
                      type="password"
                      value={profileSettingsFormik.values.currentPassword}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.currentPassword && Boolean(profileSettingsFormik.errors.currentPassword)}
                      helperText={profileSettingsFormik.touched.currentPassword && profileSettingsFormik.errors.currentPassword}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="رمز عبور جدید"
                      type="password"
                      value={profileSettingsFormik.values.newPassword}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.newPassword && Boolean(profileSettingsFormik.errors.newPassword)}
                      helperText={profileSettingsFormik.touched.newPassword && profileSettingsFormik.errors.newPassword}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="تأیید رمز عبور جدید"
                      type="password"
                      value={profileSettingsFormik.values.confirmPassword}
                      onChange={profileSettingsFormik.handleChange}
                      onBlur={profileSettingsFormik.handleBlur}
                      error={profileSettingsFormik.touched.confirmPassword && Boolean(profileSettingsFormik.errors.confirmPassword)}
                      helperText={profileSettingsFormik.touched.confirmPassword && profileSettingsFormik.errors.confirmPassword}
                      margin="normal"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    ذخیره تغییرات
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </TabPanel>

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

export default SystemSettingsPage; 