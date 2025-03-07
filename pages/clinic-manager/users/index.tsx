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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';
import ClinicManagerLayout from '../../../src/components/layout/ClinicManagerLayout';
import { Role } from '../../../src/types/auth';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('خطا در دریافت اطلاعات کاربران');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRoleFilter(event.target.value as string);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        // Update the users list
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Failed to delete user:', err);
        setError('خطا در حذف کاربر');
      }
    }
  };

  const filteredUsers = users.filter(
    (user) => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm));
      
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      
      return matchesSearch && matchesRole;
    }
  );

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'مدیر';
      case Role.CLINIC_MANAGER:
        return 'مدیر مطب';
      case Role.SECRETARY:
        return 'منشی';
      case Role.DOCTOR:
        return 'دکتر';
      case Role.OPTICIAN:
        return 'عینک‌ساز';
      default:
        return role;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'error';
      case Role.CLINIC_MANAGER:
        return 'secondary';
      case Role.SECRETARY:
        return 'info';
      case Role.DOCTOR:
        return 'primary';
      case Role.OPTICIAN:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <ClinicManagerLayout>
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
      </ClinicManagerLayout>
    );
  }

  return (
    <ClinicManagerLayout>
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
            مدیریت کاربران
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/clinic-manager/users/new')}
          >
            افزودن کاربر جدید
          </Button>
        </Box>

        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="جستجو بر اساس نام، نام کاربری، ایمیل یا شماره تماس..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="role-filter-label">نقش کاربری</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter"
              value={roleFilter}
              label="نقش کاربری"
              onChange={handleRoleFilterChange}
            >
              <MenuItem value="">همه</MenuItem>
              <MenuItem value={Role.ADMIN}>مدیر</MenuItem>
              <MenuItem value={Role.CLINIC_MANAGER}>مدیر مطب</MenuItem>
              <MenuItem value={Role.SECRETARY}>منشی</MenuItem>
              <MenuItem value={Role.DOCTOR}>دکتر</MenuItem>
              <MenuItem value={Role.OPTICIAN}>عینک‌ساز</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام کاربری</TableCell>
                <TableCell>نام و نام خانوادگی</TableCell>
                <TableCell>ایمیل</TableCell>
                <TableCell>نقش</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    هیچ کاربری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'فعال' : 'غیرفعال'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => router.push(`/clinic-manager/users/${user.id}`)}
                        title="مشاهده"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="info"
                        onClick={() => router.push(`/clinic-manager/users/${user.id}/edit`)}
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
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
    </ClinicManagerLayout>
  );
};

export default UsersPage; 