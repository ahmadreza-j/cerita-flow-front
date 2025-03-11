import React, { useEffect, useState } from 'react';
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
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import DoctorLayout from '../../src/components/layout/DoctorLayout';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل مراجعات امروز
interface TodayVisit {
  id: string;
  patientName: string;
  patientId: string;
  fileNumber: string;
  time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  hasExamination: boolean;
}

// مدل بیمار
interface Patient {
  id: string;
  fileNumber: string;
  fullName: string;
  nationalId: string;
  age?: number;
  gender?: string;
  lastVisitDate?: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);
  const [pendingVisits, setPendingVisits] = useState<TodayVisit[]>([]);
  const [completedVisits, setCompletedVisits] = useState<TodayVisit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.DOCTOR) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated && user?.role === Role.DOCTOR) {
        try {
          setLoading(true);
          
          // دریافت مراجعات امروز از API
          const visitsResponse = await api.get('/api/visits/doctor/today');
          const visitsData = visitsResponse.data.visits.map((visit: any) => ({
            id: visit.id,
            patientName: `${visit.patient_first_name} ${visit.patient_last_name}`,
            patientId: visit.patient_id,
            fileNumber: visit.file_number || `P${visit.patient_id}`,
            time: visit.visitTime,
            status: visit.status,
            hasExamination: Boolean(visit.examination_id)
          }));
          
          setTodayVisits(visitsData);
          setPendingVisits(visitsData.filter(visit => visit.status === 'pending' || visit.status === 'in_progress'));
          setCompletedVisits(visitsData.filter(visit => visit.status === 'completed'));
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, user]);

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
        age: patient.age,
        gender: patient.gender,
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

  // تبدیل جنسیت به متن فارسی
  const getGenderText = (gender?: string) => {
    switch (gender) {
      case 'male': return 'مرد';
      case 'female': return 'زن';
      case 'other': return 'سایر';
      default: return 'نامشخص';
    }
  };

  if (!isAuthenticated || !user || user.role !== Role.DOCTOR || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <DoctorLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            داشبورد پزشک
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {format(new Date(), 'yyyy/MM/dd')} - خوش آمدید {user.firstName} {user.lastName}
          </Typography>
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
                  placeholder="جستجو بر اساس نام، شماره پرونده یا کد ملی"
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
                              onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small"
                              startIcon={<MedicalServicesIcon />}
                              onClick={() => router.push(`/doctor/examinations/new?patientId=${patient.id}`)}
                            >
                              معاینه جدید
                            </Button>
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
                              {` - کد ملی: ${patient.nationalId}`}
                              {patient.age && ` - سن: ${patient.age}`}
                              {patient.gender && ` - جنسیت: ${getGenderText(patient.gender)}`}
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

          {/* مراجعات در انتظار */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="مراجعات در انتظار" 
                action={
                  <Chip 
                    label={pendingVisits.length} 
                    color="primary" 
                  />
                }
              />
              <CardContent>
                {pendingVisits.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    مراجعه‌ای در انتظار وجود ندارد.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {pendingVisits.map((visit) => (
                      <React.Fragment key={visit.id}>
                        <ListItem
                          secondaryAction={
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small"
                              startIcon={<MedicalServicesIcon />}
                              onClick={() => router.push(`/doctor/examinations/new?visitId=${visit.id}`)}
                            >
                              شروع معاینه
                            </Button>
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
                                {` - شماره پرونده: ${visit.fileNumber}`}
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

          {/* مراجعات تکمیل شده امروز */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="مراجعات تکمیل شده امروز" 
                action={
                  <Chip 
                    label={completedVisits.length} 
                    color="success" 
                  />
                }
              />
              <CardContent>
                {completedVisits.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    امروز هیچ مراجعه‌ای تکمیل نشده است.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {completedVisits.map((visit) => (
                      <React.Fragment key={visit.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => router.push(`/doctor/examinations/${visit.id}`)}
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
                                {` - شماره پرونده: ${visit.fileNumber}`}
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

          {/* آمار کلی */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                آمار امروز
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        کل مراجعات
                      </Typography>
                      <Typography variant="h5" component="div">
                        {todayVisits.length}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        در انتظار
                      </Typography>
                      <Typography variant="h5" component="div">
                        {pendingVisits.length}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <EventIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        تکمیل شده
                      </Typography>
                      <Typography variant="h5" component="div">
                        {completedVisits.length}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DoctorLayout>
  );
} 