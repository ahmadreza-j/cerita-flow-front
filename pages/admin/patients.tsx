import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Button,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useAuth from '../../src/hooks/useAuth';
import { Role } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DataTable from '../../src/components/common/DataTable';
import api from '../../src/utils/api';
import { format } from 'date-fns-jalali';

// مدل داده بیمار
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  birthDate: string;
  createdAt: string;
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

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
    const fetchPatients = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          
          // دریافت لیست بیماران از API
          const response = await api.get('/api/patients');
          
          setPatients(response.data.patients || []);
          setTotalCount(response.data.totalCount || 0);
          
        } catch (error) {
          console.error('Error fetching patients:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPatients();
  }, [isAuthenticated, user]);

  const handleAddPatient = () => {
    router.push('/patients/new');
  };

  const handleViewPatient = (id: string) => {
    router.push(`/patients/${id}`);
  };

  const handleEditPatient = (id: string) => {
    router.push(`/patients/${id}/edit`);
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('آیا از حذف این بیمار اطمینان دارید؟')) {
      try {
        await api.delete(`/api/patients/${id}`);
        // بروزرسانی لیست بیماران پس از حذف
        setPatients(patients.filter(patient => patient.id !== id));
        setTotalCount(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('خطا در حذف بیمار');
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // تعریف ستون‌های جدول
  const columns = [
    { 
      id: 'fullName', 
      label: 'نام و نام خانوادگی', 
      minWidth: 150,
      format: (value: string, row: Patient) => `${row.firstName} ${row.lastName}`
    },
    { id: 'nationalId', label: 'کد ملی', minWidth: 120 },
    { id: 'phoneNumber', label: 'شماره تماس', minWidth: 120 },
    { 
      id: 'birthDate', 
      label: 'تاریخ تولد', 
      minWidth: 100,
      format: (value: string) => value || '-'
    },
    { 
      id: 'createdAt', 
      label: 'تاریخ ثبت', 
      minWidth: 100,
      format: (value: string) => format(new Date(value), 'yyyy/MM/dd')
    },
    { 
      id: 'actions', 
      label: 'عملیات', 
      minWidth: 120,
      format: (value: any, row: Patient) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => handleViewPatient(row.id)}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton 
            color="secondary" 
            onClick={() => handleEditPatient(row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeletePatient(row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    },
  ];

  // تبدیل داده‌ها به فرمت مورد نیاز DataTable
  const tableData = patients.map(patient => ({
    ...patient,
    fullName: `${patient.firstName} ${patient.lastName}`,
  }));

  // فیلتر کردن داده‌ها بر اساس جستجو
  const filteredData = searchTerm
    ? tableData.filter(row => 
        row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.nationalId && row.nationalId.includes(searchTerm)) ||
        (row.phoneNumber && row.phoneNumber.includes(searchTerm))
      )
    : tableData;

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
            مدیریت بیماران
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddPatient}
          >
            افزودن بیمار جدید
          </Button>
        </Box>

        <DataTable 
          columns={columns} 
          data={filteredData}
          title="لیست بیماران"
          searchPlaceholder="جستجو بر اساس نام، کد ملی یا شماره تماس..."
          onSearch={handleSearch}
        />
      </Container>
    </AdminLayout>
  );
} 