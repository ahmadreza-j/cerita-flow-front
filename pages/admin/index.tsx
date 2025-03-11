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
  IconButton
} from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل داده‌های آماری
interface DashboardStats {
  totalPatients: number;
  totalVisits: number;
  totalProducts: number;
  totalSales: number;
  todayVisits: number;
  todaySales: number;
}

// مدل مراجعات امروز
interface TodayVisit {
  id: string;
  patientName: string;
  time: string;
  doctorName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalVisits: 0,
    totalProducts: 0,
    totalSales: 0,
    todayVisits: 0,
    todaySales: 0
  });
  const [todayVisits, setTodayVisits] = useState<TodayVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.ADMIN) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          
          // دریافت آمار کلی از API
          const statsResponse = await api.get('/api/stats/dashboard');
          const statsData = statsResponse.data;
          
          setStats({
            totalPatients: statsData.totalPatients,
            totalVisits: statsData.totalVisits,
            totalProducts: statsData.totalProducts,
            totalSales: statsData.totalSales,
            todayVisits: statsData.todayVisits,
            todaySales: statsData.todaySales
          });
          
          // دریافت ویزیت‌های امروز از API
          const today = new Date().toISOString().split('T')[0];
          const visitsResponse = await api.get(`/api/visits/clinic?startDate=${today}&endDate=${today}`);
          
          const visitsData = visitsResponse.data.map((visit: any) => ({
            id: visit.id,
            patientName: `${visit.patient_first_name} ${visit.patient_last_name}`,
            time: visit.appointment_time,
            doctorName: `${visit.doctor_first_name} ${visit.doctor_last_name}`,
            status: visit.status
          }));
          
          setTodayVisits(visitsData);
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== Role.ADMIN || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

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
      case 'pending': return 'info.main';
      case 'in_progress': return 'warning.main';
      case 'completed': return 'success.main';
      case 'cancelled': return 'error.main';
      default: return 'text.primary';
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            داشبورد مدیریت کلینیک سریتا
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {format(new Date(), 'yyyy/MM/dd')} - خوش آمدید {user.firstName} {user.lastName}
          </Typography>
        </Box>

        {/* آمار کلی */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                بیماران
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.totalPatients}
              </Typography>
              <Typography variant="body2">
                تعداد کل بیماران ثبت شده
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                مراجعات
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.totalVisits}
              </Typography>
              <Typography variant="body2">
                تعداد کل مراجعات ثبت شده
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'success.light',
                color: 'success.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                محصولات
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2">
                تعداد کل محصولات موجود
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'info.light',
                color: 'info.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                فروش
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.totalSales}
              </Typography>
              <Typography variant="body2">
                تعداد کل فاکتورهای فروش
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* آمار امروز و دسترسی سریع */}
        <Grid container spacing={3}>
          {/* آمار امروز */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="آمار امروز" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <EventIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          مراجعات امروز
                        </Typography>
                        <Typography variant="h5" component="div">
                          {stats.todayVisits}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <ReceiptIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          فروش امروز
                        </Typography>
                        <Typography variant="h5" component="div">
                          {stats.todaySales}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  دسترسی سریع
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<PersonIcon />}
                      onClick={() => router.push('/admin/users')}
                    >
                      مدیریت کاربران
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<InventoryIcon />}
                      onClick={() => router.push('/admin/products')}
                    >
                      مدیریت محصولات
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<MedicalServicesIcon />}
                      onClick={() => router.push('/admin/patients')}
                    >
                      مدیریت بیماران
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<ReceiptIcon />}
                      onClick={() => router.push('/admin/sales')}
                    >
                      گزارش فروش
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* مراجعات امروز */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="مراجعات امروز" 
                action={
                  <Button 
                    size="small" 
                    onClick={() => router.push('/admin/visits')}
                  >
                    مشاهده همه
                  </Button>
                }
              />
              <CardContent>
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {todayVisits.map((visit) => (
                    <React.Fragment key={visit.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" onClick={() => router.push(`/visits/${visit.id}`)}>
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
                          primary={visit.patientName}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {visit.time}
                              </Typography>
                              {` - ${visit.doctorName}`}
                              <Typography
                                sx={{ display: 'block', color: getStatusColor(visit.status) }}
                                component="span"
                                variant="body2"
                              >
                                {getStatusText(visit.status)}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
} 