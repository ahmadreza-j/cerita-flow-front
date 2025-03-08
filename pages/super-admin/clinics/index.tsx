import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import api from '../../../src/utils/api';
import SuperAdminLayout from '../../../src/components/layout/SuperAdminLayout';
import { Clinic } from '../../../src/types/auth';
import { formatPersianDate } from '../../../src/utils/dateUtils';

const ClinicsPage: React.FC = () => {
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get('/api/super-admin/clinics');
        setClinics(response.data.clinics || []);
      } catch (err) {
        console.error('Failed to fetch clinics:', err);
        setError('خطا در دریافت اطلاعات مطب‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clinic.address && clinic.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (clinic.managerName && clinic.managerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <SuperAdminLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1">
            مدیریت مطب‌ها
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/super-admin/clinics/new')}
          >
            افزودن مطب جدید
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="جستجو بر اساس نام، آدرس یا مدیر مطب..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام مطب</TableCell>
                <TableCell>مدیر</TableCell>
                <TableCell>آدرس</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell>تاریخ ثبت</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClinics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    هیچ مطبی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClinics.map((clinic) => (
                  <TableRow key={clinic.id}>
                    <TableCell>{clinic.name}</TableCell>
                    <TableCell>{clinic.managerName || 'تعیین نشده'}</TableCell>
                    <TableCell>{clinic.address || 'ثبت نشده'}</TableCell>
                    <TableCell>
                      <Chip
                        label={clinic.isActive ? 'فعال' : 'غیرفعال'}
                        color={clinic.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatPersianDate(new Date(clinic.createdAt))}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => router.push(`/super-admin/clinics/${clinic.id}`)}
                        title="مشاهده"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={() => router.push(`/super-admin/clinics/${clinic.id}/edit`)}
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          // Handle delete
                          if (window.confirm('آیا از حذف این مطب اطمینان دارید؟')) {
                            // Delete logic
                          }
                        }}
                        title="حذف"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </SuperAdminLayout>
  );
};

export default ClinicsPage; 