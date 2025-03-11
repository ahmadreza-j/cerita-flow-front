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
  TextField,
  InputAdornment,
  Fab,
  Chip
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.SECRETARY) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated && user?.role === Role.SECRETARY) {
        try {
          setLoading(true);
          
          // دریافت مراجعات امروز از API
          const today = new Date().toISOString().split('T')[0];
          const visitsResponse = await api.get(`/api/visits/clinic?startDate=${today}&endDate=${today}`);
          const visitsData = visitsResponse.data.visits.map((visit: any) => ({
            id: visit.id,
            patientName: `${visit.patient_first_name} ${visit.patient_last_name}`,
            patientId: visit.patient_id,
            time: visit.visitTime,
            doctorName: `${visit.doctor_first_name} ${visit.doctor_last_name}`,
            status: visit.status
          }));
          
          setTodayVisits(visitsData);
          
          // دریافت بیماران اخیر از API
          const patientsResponse = await api.get('/api/patients/search?limit=5&sort=lastVisit');
          const patientsData = patientsResponse.data.patients.map((patient: any) => ({
            id: patient.id,
            fileNumber: patient.file_number || `P${patient.id}`,
            fullName: `${patient.first_name} ${patient.last_name}`,
            nationalId: patient.national_id,
            phoneNumber: patient.phone,
            lastVisitDate: patient.last_visit_date
          }));
          
          setRecentPatients(patientsData);
          
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
              {format(new Date(), 'yyyy/MM/dd')} - خوش آمدید {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/secretary/patients/new')}
          >
            ثبت بیمار جدید
          </Button>
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
                              onClick={() => router.push(`/secretary/patients/${patient.id}`)}
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
                  <Button 
                    size="small" 
                    onClick={() => router.push('/secretary/visits')}
                  >
                    مشاهده همه
                  </Button>
                }
              />
              <CardContent>
                {todayVisits.length === 0 ? (
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
                    onClick={() => router.push('/secretary/patients')}
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
                              onClick={() => router.push(`/secretary/patients/${patient.id}`)}
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