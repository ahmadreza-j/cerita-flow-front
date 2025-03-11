import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DataTable from '../../src/components/common/DataTable';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل داده مراجعه
interface Visit {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  visitDate: string;
  visitTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  reason: string;
  createdAt: string;
}

export default function AdminVisitsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

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
    const fetchVisits = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          
          // دریافت لیست مراجعات از API
          const response = await api.get('/api/visits', {
            params: {
              status: statusFilter,
              date: dateFilter
            }
          });
          
          setVisits(response.data.visits || []);
          setTotalCount(response.data.totalCount || 0);
          
        } catch (error) {
          console.error('Error fetching visits:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchVisits();
  }, [isAuthenticated, user, statusFilter, dateFilter]);

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleDateFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(event.target.value);
  };

  const handleAddVisit = () => {
    router.push('/visits/new');
  };

  const handleViewVisit = (id: string) => {
    router.push(`/visits/${id}`);
  };

  const handleEditVisit = (id: string) => {
    router.push(`/visits/${id}/edit`);
  };

  const handleDeleteVisit = async (id: string) => {
    if (window.confirm('آیا از حذف این مراجعه اطمینان دارید؟')) {
      try {
        await api.delete(`/api/visits/${id}`);
        // بروزرسانی لیست مراجعات پس از حذف
        setVisits(visits.filter(visit => visit.id !== id));
        setTotalCount(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting visit:', error);
        alert('خطا در حذف مراجعه');
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
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

  // تعریف ستون‌های جدول
  const columns = [
    { id: 'patientName', label: 'نام بیمار', minWidth: 150 },
    { id: 'doctorName', label: 'نام پزشک', minWidth: 150 },
    { id: 'visitDate', label: 'تاریخ مراجعه', minWidth: 120 },
    { id: 'visitTime', label: 'ساعت مراجعه', minWidth: 100 },
    { 
      id: 'status', 
      label: 'وضعیت', 
      minWidth: 120,
      format: (value: string) => (
        <Chip 
          label={getStatusText(value)} 
          color={getStatusColor(value) as any}
          size="small"
        />
      )
    },
    { 
      id: 'reason', 
      label: 'علت مراجعه', 
      minWidth: 200,
      format: (value: string) => value || '-'
    },
    { 
      id: 'actions', 
      label: 'عملیات', 
      minWidth: 120,
      format: (value: any, row: Visit) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => handleViewVisit(row.id)}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton 
            color="secondary" 
            onClick={() => handleEditVisit(row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeleteVisit(row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    },
  ];

  // فیلتر کردن داده‌ها بر اساس جستجو
  const filteredData = searchTerm
    ? visits.filter(visit => 
        visit.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (visit.reason && visit.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : visits;

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
            مدیریت مراجعات
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              sx={{ mr: 2 }}
            >
              فیلترها
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleAddVisit}
            >
              ثبت مراجعه جدید
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-filter-label">وضعیت</InputLabel>
                  <Select<string>
                    labelId="status-filter-label"
                    value={statusFilter}
                    label="وضعیت"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="">همه</MenuItem>
                    <MenuItem value="pending">در انتظار</MenuItem>
                    <MenuItem value="in_progress">در حال انجام</MenuItem>
                    <MenuItem value="completed">تکمیل شده</MenuItem>
                    <MenuItem value="cancelled">لغو شده</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="تاریخ مراجعه"
                  type="date"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        <DataTable 
          columns={columns} 
          data={filteredData}
          title="لیست مراجعات"
          searchPlaceholder="جستجو بر اساس نام بیمار، پزشک یا علت مراجعه..."
          onSearch={handleSearch}
        />
      </Container>
    </AdminLayout>
  );
} 