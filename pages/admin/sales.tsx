import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل داده فروش
interface Sale {
  id: string;
  invoiceNumber: string;
  patientName: string;
  patientId: string;
  totalAmount: number;
  itemsCount: number;
  paymentMethod: string;
  status: 'paid' | 'pending' | 'cancelled';
  createdAt: string;
}

// مدل داده آمار فروش
interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  todaySales: number;
  todayRevenue: number;
  weekSales: number;
  weekRevenue: number;
  monthSales: number;
  monthRevenue: number;
}

export default function AdminSalesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0,
    weekSales: 0,
    weekRevenue: 0,
    monthSales: 0,
    monthRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

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
    const fetchSalesData = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          
          // دریافت آمار فروش از API
          const statsResponse = await api.get('/api/sales/stats');
          setStats(statsResponse.data || {});
          
          // دریافت لیست فروش از API
          const salesResponse = await api.get('/api/sales', {
            params: {
              page: page + 1,
              limit: rowsPerPage,
              search: searchTerm,
              startDate,
              endDate,
              status: statusFilter,
              period: ['all', 'today', 'week', 'month'][tabValue]
            }
          });
          
          setSales(salesResponse.data.sales || []);
          setTotalCount(salesResponse.data.totalCount || 0);
          
        } catch (error) {
          console.error('Error fetching sales data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchSalesData();
  }, [isAuthenticated, user, page, rowsPerPage, searchTerm, tabValue, startDate, endDate, statusFilter]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
    setPage(0);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleViewSale = (id: string) => {
    router.push(`/admin/sales/${id}`);
  };

  const handlePrintInvoice = (id: string) => {
    window.open(`/api/sales/${id}/print`, '_blank');
  };

  const handleExportReport = () => {
    const params = new URLSearchParams({
      startDate: startDate || '',
      endDate: endDate || '',
      status: statusFilter || '',
      period: ['all', 'today', 'week', 'month'][tabValue]
    });
    
    window.open(`/api/sales/export?${params.toString()}`, '_blank');
  };

  // فرمت قیمت به تومان
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  // تبدیل وضعیت به متن فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'پرداخت شده';
      case 'pending': return 'در انتظار پرداخت';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  // تبدیل وضعیت به رنگ
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (!isAuthenticated || !user || user.role !== Role.ADMIN) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        در حال بارگذاری...
      </Box>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            گزارش فروش
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />}
            onClick={handleExportReport}
          >
            دانلود گزارش
          </Button>
        </Box>

        {/* آمار فروش */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ReceiptIcon color="primary" />
                  </Box>
                  <Typography variant="h6">کل فروش</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>{stats.totalSales}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(stats.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'success.light', 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AttachMoneyIcon color="success" />
                  </Box>
                  <Typography variant="h6">امروز</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>{stats.todaySales}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(stats.todayRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'info.light', 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingCartIcon color="info" />
                  </Box>
                  <Typography variant="h6">هفته جاری</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>{stats.weekSales}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(stats.weekRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    bgcolor: 'secondary.light', 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DateRangeIcon color="secondary" />
                  </Box>
                  <Typography variant="h6">ماه جاری</Typography>
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>{stats.monthSales}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(stats.monthRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="sales period tabs">
              <Tab label="همه" />
              <Tab label="امروز" />
              <Tab label="هفته جاری" />
              <Tab label="ماه جاری" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="جستجو بر اساس شماره فاکتور یا نام بیمار..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="از تاریخ"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 150 }}
              />
              
              <TextField
                label="تا تاریخ"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ minWidth: 150 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">وضعیت</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="وضعیت"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="">همه</MenuItem>
                  <MenuItem value="paid">پرداخت شده</MenuItem>
                  <MenuItem value="pending">در انتظار پرداخت</MenuItem>
                  <MenuItem value="cancelled">لغو شده</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>شماره فاکتور</TableCell>
                    <TableCell>نام بیمار</TableCell>
                    <TableCell>تاریخ</TableCell>
                    <TableCell>تعداد اقلام</TableCell>
                    <TableCell>مبلغ کل</TableCell>
                    <TableCell>روش پرداخت</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">در حال بارگذاری...</TableCell>
                    </TableRow>
                  ) : sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">هیچ فاکتوری یافت نشد</TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.invoiceNumber}</TableCell>
                        <TableCell>{sale.patientName}</TableCell>
                        <TableCell>{format(new Date(sale.createdAt), 'yyyy/MM/dd')}</TableCell>
                        <TableCell>{sale.itemsCount}</TableCell>
                        <TableCell>{formatPrice(sale.totalAmount)}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{ 
                              color: `${getStatusColor(sale.status)}.main`,
                              fontWeight: 'medium'
                            }}
                          >
                            {getStatusText(sale.status)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleViewSale(sale.id)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            color="secondary" 
                            onClick={() => handlePrintInvoice(sale.id)}
                            size="small"
                          >
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="تعداد در هر صفحه:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
            />
          </Box>
        </Paper>
      </Container>
    </AdminLayout>
  );
} 