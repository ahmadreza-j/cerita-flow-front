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
  InputAdornment,
  Fab
} from '@mui/material';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import OpticianLayout from '../../src/components/layout/OpticianLayout';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل بیماران نیازمند عینک
interface GlassesNeededPatient {
  id: string;
  patientName: string;
  fileNumber: string;
  examinationDate: string;
  doctorName: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// مدل محصول
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
}

// مدل فروش
interface Sale {
  id: string;
  patientName: string;
  date: string;
  totalAmount: number;
  status: 'pending' | 'completed';
  items: number;
}

export default function OpticianDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [patientsNeedingGlasses, setPatientsNeedingGlasses] = useState<GlassesNeededPatient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    pendingGlasses: 0,
    todaySales: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== Role.OPTICIAN) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isAuthenticated && user?.role === Role.OPTICIAN) {
        try {
          setLoading(true);
          
          // دریافت بیماران نیازمند عینک از API
          const patientsResponse = await api.get('/api/glasses/needed');
          const patientsData = patientsResponse.data.patients.map((patient: any) => ({
            id: patient.id,
            patientName: `${patient.first_name} ${patient.last_name}`,
            fileNumber: patient.file_number || `P${patient.id}`,
            examinationDate: patient.examination_date,
            doctorName: `${patient.doctor_first_name} ${patient.doctor_last_name}`,
            status: patient.status || 'pending'
          }));
          
          setPatientsNeedingGlasses(patientsData);
          
          // دریافت محصولات از API
          const productsResponse = await api.get('/api/products');
          const productsData = productsResponse.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            category: product.type,
            brand: product.brand,
            price: product.selling_price,
            stock: product.quantity
          }));
          
          setProducts(productsData);
          
          // دریافت فروش‌های اخیر از API
          const salesResponse = await api.get('/api/sales?limit=5');
          const salesData = salesResponse.data.map((sale: any) => ({
            id: sale.id,
            patientName: sale.patient_name,
            date: sale.sale_date,
            totalAmount: sale.final_amount,
            status: sale.payment_status || 'completed',
            items: sale.items.length
          }));
          
          setRecentSales(salesData);
          
          // آمار کلی
          setStats({
            totalProducts: productsData.length,
            lowStockProducts: productsData.filter(p => p.stock <= 5).length,
            pendingGlasses: patientsData.length,
            todaySales: salesData.filter(s => {
              const today = new Date().toISOString().split('T')[0];
              return s.date.includes(today);
            }).length
          });
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
  }, [isAuthenticated, user]);

  // جستجوی محصول
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // جستجوی محصول از API
      const response = await api.get(`/api/products?search=${searchQuery}`);
      
      const productsData = response.data.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.type,
        brand: product.brand,
        price: product.selling_price,
        stock: product.quantity
      }));
      
      setSearchResults(productsData);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  // تبدیل وضعیت به متن فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'در انتظار';
      case 'in_progress': return 'در حال انجام';
      case 'completed': return 'تکمیل شده';
      default: return status;
    }
  };

  // تبدیل وضعیت به رنگ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // فرمت قیمت
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  if (!isAuthenticated || !user || user.role !== Role.OPTICIAN || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <OpticianLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              داشبورد عینک‌ساز
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {format(new Date(), 'yyyy/MM/dd')} - خوش آمدید {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/optician/sales/new')}
          >
            ثبت فروش جدید
          </Button>
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
                محصولات
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.totalProducts}
              </Typography>
              <Typography variant="body2">
                تعداد کل محصولات
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
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
              }}
            >
              <Typography variant="h6" gutterBottom>
                موجودی کم
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.lowStockProducts}
              </Typography>
              <Typography variant="body2">
                محصولات با موجودی کم
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
                عینک‌های در انتظار
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.pendingGlasses}
              </Typography>
              <Typography variant="body2">
                بیماران نیازمند عینک
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
                فروش امروز
              </Typography>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                {stats.todaySales}
              </Typography>
              <Typography variant="body2">
                تعداد فروش‌های امروز
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* جستجوی محصول */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                جستجوی محصول
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="جستجو بر اساس نام، برند یا دسته‌بندی"
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
                    {searchResults.map((product) => (
                      <ListItem
                        key={product.id}
                        secondaryAction={
                          <Box>
                            <IconButton 
                              edge="end" 
                              sx={{ mr: 1 }}
                              onClick={() => router.push(`/optician/products/${product.id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              edge="end"
                              onClick={() => router.push(`/optician/products/${product.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <InventoryIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {`برند: ${product.brand}`}
                              </Typography>
                              {` - دسته‌بندی: ${product.category}`}
                              <Typography
                                sx={{ display: 'block' }}
                                component="span"
                                variant="body2"
                                color={product.stock <= 5 ? 'error.main' : 'text.primary'}
                              >
                                {`قیمت: ${formatPrice(product.price)} - موجودی: ${product.stock} عدد`}
                              </Typography>
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

          {/* بیماران نیازمند عینک */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="بیماران نیازمند عینک" 
                action={
                  <Button 
                    size="small" 
                    onClick={() => router.push('/optician/glasses-needed')}
                  >
                    مشاهده همه
                  </Button>
                }
              />
              <CardContent>
                {patientsNeedingGlasses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    بیماری در انتظار عینک وجود ندارد.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {patientsNeedingGlasses.map((patient) => (
                      <React.Fragment key={patient.id}>
                        <ListItem
                          secondaryAction={
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small"
                              onClick={() => router.push(`/optician/sales/new?patientId=${patient.id}`)}
                            >
                              ثبت فروش
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
                                  {patient.patientName}
                                </Typography>
                                <Chip 
                                  label={getStatusText(patient.status)} 
                                  color={getStatusColor(patient.status) as any}
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
                                  {`شماره پرونده: ${patient.fileNumber}`}
                                </Typography>
                                {` - تاریخ معاینه: ${patient.examinationDate}`}
                                <Typography
                                  sx={{ display: 'block' }}
                                  component="span"
                                  variant="body2"
                                >
                                  {`پزشک: ${patient.doctorName}`}
                                </Typography>
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

          {/* فروش‌های اخیر */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="فروش‌های اخیر" 
                action={
                  <Button 
                    size="small" 
                    onClick={() => router.push('/optician/sales')}
                  >
                    مشاهده همه
                  </Button>
                }
              />
              <CardContent>
                {recentSales.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" align="center">
                    فروشی ثبت نشده است.
                  </Typography>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {recentSales.map((sale) => (
                      <React.Fragment key={sale.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => router.push(`/optician/sales/${sale.id}`)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <ShoppingCartIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography component="span">
                                  {sale.patientName}
                                </Typography>
                                <Chip 
                                  label={getStatusText(sale.status)} 
                                  color={getStatusColor(sale.status) as any}
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
                                  {`تاریخ: ${sale.date}`}
                                </Typography>
                                {` - تعداد اقلام: ${sale.items}`}
                                <Typography
                                  sx={{ display: 'block', fontWeight: 'bold' }}
                                  component="span"
                                  variant="body2"
                                  color="success.main"
                                >
                                  {`مبلغ کل: ${formatPrice(sale.totalAmount)}`}
                                </Typography>
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

        {/* دکمه ثابت برای ثبت سریع محصول جدید */}
        <Fab
          color="secondary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => router.push('/optician/products/new')}
        >
          <AddIcon />
        </Fab>
      </Container>
    </OpticianLayout>
  );
} 