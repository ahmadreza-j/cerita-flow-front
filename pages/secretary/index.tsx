import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  Chip,
  CircularProgress
} from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import SecretaryLayout from '../../src/components/layout/SecretaryLayout';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل مراجعات امروز
interface TodayVisit {
  id: string;
  patientName: string;
  patientId: string;
  time: string;
  doctorName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// مدل بیمار
interface Patient {
  id: string;
  fileNumber: string;
  fullName: string;
  nationalId: string;
  phoneNumber: string;
  lastVisitDate?: string;
}

export default function SecretaryDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.SECRETARY) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // استخراج تابع fetchDashboardData به عنوان یک useCallback
  const fetchDashboardData = useCallback(async () => {
    if (isAuthenticated && user?.role === Role.SECRETARY) {
      try {
        setRefreshing(true);
        
        // دریافت مراجعات امروز از API
        // تغییر فرمت تاریخ برای تطابق با فرمت ذخیره شده در دیتابیس
        // در دیتابیس تاریخ به فرمت شمسی ذخیره می‌شود (YYYY/MM/DD)
        const today = new Date();
        const persianDate = format(today, 'yyyy/MM/dd');
        console.log('Fetching visits for Persian date:', persianDate);
        
        const visitsResponse = await api.get(`/api/visits/clinic?startDate=${persianDate}&endDate=${persianDate}`);
        console.log('Visits API response:', visitsResponse.data);
        
        if (visitsResponse.data && Array.isArray(visitsResponse.data.visits)) {
          const visitsData = visitsResponse.data.visits.map((visit: any) => ({
            id: visit.id,
            patientName: `${visit.patient_first_name} ${visit.patient_last_name}`,
            patientId: visit.patient_id,
            time: visit.visitTime || format(new Date(`2000-01-01T${visit.visit_time}`), 'HH:mm'),
            doctorName: visit.doctor_id ? `${visit.doctor_first_name} ${visit.doctor_last_name}` : 'تعیین نشده',
            status: visit.status
          }));
          
          setTodayVisits(visitsData);
        } else {
          console.error('Invalid visits data format:', visitsResponse.data);
          setTodayVisits([]);
        }
        
        // دریافت بیماران اخیر از API
        const patientsResponse = await api.get('/api/patients/recent?limit=5&sort=lastVisit');
        
        if (patientsResponse.data && Array.isArray(patientsResponse.data.patients)) {
          const patientsData = patientsResponse.data.patients.map((patient: any) => ({
            id: patient.id,
            fileNumber: patient.file_number || `P${patient.id}`,
            fullName: `${patient.first_name} ${patient.last_name}`,
            nationalId: patient.national_id,
            phoneNumber: patient.phone,
            lastVisitDate: patient.last_visit_date
          }));
          
          setRecentPatients(patientsData);
        } else {
          console.error('Invalid patients data format:', patientsResponse.data);
          setRecentPatients([]);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setTodayVisits([]);
        setRecentPatients([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // تابع بازیابی مجدد اطلاعات
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // جستجوی بیمار
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // جستجوی بیمار از API
      const response = await api.get(`/api/patients/search?searchTerm=${searchQuery}`);
      
      const patientsData = response.data.patients.map((patient: any) => ({
        id: patient.id,
        fileNumber: patient.file_number || `P${patient.id}`,
        fullName: `${patient.first_name} ${patient.last_name}`,
        nationalId: patient.national_id,
        phoneNumber: patient.phone,
        lastVisitDate: patient.last_visit_date
      }));
      
      setSearchResults(patientsData);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  // تبدیل وضعیت به متن فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'در انتظار';
      case 'in_progress': return 'در حال انجام';
      case 'completed': return 'تکمیل شده';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  // تبدیل وضعیت به رنگ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (!isAuthenticated || !user || user.role !== Role.SECRETARY || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <SecretaryLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              داشبورد منشی
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {format(new Date(), 'yyyy/MM/dd')} - خوش آمدید {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              بازیابی
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/patients/new')}
            >
              ثبت بیمار جدید
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* جستجوی بیمار */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                جستجوی بیمار
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="جستجو بر اساس نام، شماره پرونده، کد ملی یا شماره تماس"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ml: 1 }}
                />
                <Button variant="contained" onClick={handleSearch}>
                  جستجو
                </Button>
              </Box>

              {searchResults.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    نتایج جستجو:
                  </Typography>
                  <List>
                    {searchResults.map((patient) => (
                      <ListItem
                        key={patient.id}
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              sx={{ mr: 1 }}
                              onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              edge="end"
                              onClick={() => router.push(`/secretary/visits/new?patientId=${patient.id}`)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={patient.fullName}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {`شماره پرونده: ${patient.fileNumber}`}
                              </Typography>
                              {` - کد ملی: ${patient.nationalId} - تلفن: ${patient.phoneNumber}`}
                              {patient.lastVisitDate && ` - آخرین مراجعه: ${patient.lastVisitDate}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* مراجعات امروز */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader 
                title="مراجعات امروز" 
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                    <Button 
                      size="small" 
                      onClick={() => router.push('/secretary/visits')}
                    >
                      مشاهده همه
                    </Button>
                  </Box>
                }
              />
              <CardContent>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : todayVisits.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    امروز مراجعه‌ای ثبت نشده است.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {todayVisits.map((visit) => (
                      <React.Fragment key={visit.id}>
                        <ListItem
                          secondaryAction={
                            <Box>
                              <IconButton 
                                edge="end" 
                                sx={{ mr: 1 }}
                                onClick={() => router.push(`/secretary/visits/${visit.id}`)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton 
                                edge="end"
                                onClick={() => router.push(`/secretary/visits/${visit.id}/edit`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography component="span">
                                  {visit.patientName}
                                </Typography>
                                <Chip 
                                  label={getStatusText(visit.status)} 
                                  color={getStatusColor(visit.status) as any}
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {`ساعت: ${visit.time}`}
                                </Typography>
                                {` - ${visit.doctorName}`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* بیماران اخیر */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader 
                title="بیماران اخیر" 
                action={
                  <Button 
                    size="small" 
                    onClick={() => router.push('/patients')}
                  >
                    مشاهده همه
                  </Button>
                }
              />
              <CardContent>
                {recentPatients.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    هیچ بیماری ثبت نشده است.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {recentPatients.map((patient) => (
                      <React.Fragment key={patient.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={patient.fullName}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  sx={{ display: 'inline' }}
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {`شماره پرونده: ${patient.fileNumber}`}
                                </Typography>
                                {patient.lastVisitDate && ` - آخرین مراجعه: ${patient.lastVisitDate}`}
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* دکمه ثابت برای ثبت سریع مراجعه جدید */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => router.push('/secretary/visits/new')}
        >
          <AddIcon />
        </Fab>
      </Container>
    </SecretaryLayout>
  );
} 