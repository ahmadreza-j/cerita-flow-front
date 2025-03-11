import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import useAuth from '../../src/hooks/useAuth';
import { Role, RegisterData } from '../../src/types/auth';
import AdminLayout from '../../src/components/layout/AdminLayout';
import DataTable from '../../src/components/common/DataTable';
import api from '../../src/utils/api';

// کامپوننت فرم کاربر بر اساس RegisterForm
import RegisterForm from '../../src/components/auth/RegisterForm';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  createdAt: string;
}

export default function UserManagement() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    const fetchUsers = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          const response = await api.get('/api/users');
          // Transform the API response to match our User interface
          const transformedUsers = (response.data.users || []).map(apiUser => ({
            id: apiUser.id.toString(),
            username: apiUser.username,
            email: apiUser.email,
            firstName: apiUser.first_name,
            lastName: apiUser.last_name,
            phoneNumber: apiUser.phone_number || '',
            role: apiUser.role,
            createdAt: apiUser.created_at
          }));
          setUsers(transformedUsers);
        } catch (error) {
          console.error('Error fetching users:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUsers();
  }, [isAuthenticated, user]);

  const handleAddUser = () => {
    setEditingUser(null);
    setOpenDialog(true);
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setOpenDialog(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        await api.delete(`/api/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('خطا در حذف کاربر');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitUserForm = async (values: RegisterData) => {
    try {
      if (editingUser) {
        // ویرایش کاربر موجود
        const response = await api.put(`/api/users/${editingUser.id}`, values);
        // Refresh the user list after update
        const updatedResponse = await api.get('/api/users');
        // Transform the API response to match our User interface
        const transformedUsers = (updatedResponse.data.users || []).map(apiUser => ({
          id: apiUser.id.toString(),
          username: apiUser.username,
          email: apiUser.email,
          firstName: apiUser.first_name,
          lastName: apiUser.last_name,
          phoneNumber: apiUser.phone_number || '',
          role: apiUser.role,
          createdAt: apiUser.created_at
        }));
        setUsers(transformedUsers);
      } else {
        // افزودن کاربر جدید
        const response = await api.post('/api/users', values);
        // تبدیل داده‌های دریافتی به فرمت مورد نیاز برای نمایش در جدول
        const newUser = {
          id: response.data.id.toString(),
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName || response.data.first_name || '',
          lastName: response.data.lastName || response.data.last_name || '',
          phoneNumber: response.data.phoneNumber || response.data.phone_number || '',
          role: response.data.role,
          createdAt: response.data.createdAt || response.data.created_at
        };
        setUsers([...users, newUser]);
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('خطا در ذخیره اطلاعات کاربر');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // تعریف ستون‌های جدول
  const columns = [
    { id: 'username', label: 'نام کاربری', minWidth: 100 },
    { id: 'fullName', label: 'نام و نام خانوادگی', minWidth: 150,
      format: (value: string, row: User) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-'
    },
    { id: 'email', label: 'ایمیل', minWidth: 170 },
    { id: 'phoneNumber', label: 'شماره تماس', minWidth: 120,
      format: (value: string) => value || '-'
    },
    { id: 'role', label: 'نقش', minWidth: 100,
      format: (value: Role) => {
        let color;
        let label;
        switch (value) {
          case Role.ADMIN:
            color = 'error';
            label = 'مدیر';
            break;
          case Role.DOCTOR:
            color = 'primary';
            label = 'پزشک';
            break;
          case Role.OPTICIAN:
            color = 'success';
            label = 'اپتیسین';
            break;
          case Role.SECRETARY:
            color = 'info';
            label = 'منشی';
            break;
          default:
            color = 'default';
            label = value;
        }
        return <Chip label={label} color={color as any} size="small" />;
      }
    },
    { id: 'actions', label: 'عملیات', minWidth: 120,
      format: (value: any, row: User) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => handleEditUser(row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeleteUser(row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    },
  ];

  // تبدیل داده‌ها به فرمت مورد نیاز DataTable
  const tableData = users.map(user => ({
    ...user,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '-',
  }));

  // فیلتر کردن داده‌ها بر اساس جستجو
  const filteredData = searchTerm
    ? tableData.filter(row => 
        row.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            مدیریت کاربران
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            افزودن کاربر جدید
          </Button>
        </Box>

        <DataTable 
          columns={columns} 
          data={filteredData}
          title="لیست کاربران"
          searchPlaceholder="جستجو بر اساس نام، نام کاربری یا ایمیل..."
          onSearch={handleSearch}
        />

        {/* دیالوگ افزودن/ویرایش کاربر */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
            <IconButton
              aria-label="close"
              onClick={handleCloseDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <RegisterForm 
              onSubmit={handleSubmitUserForm} 
              initialValues={editingUser ? {
                username: editingUser.username,
                email: editingUser.email,
                password: '',
                firstName: editingUser.firstName || '',
                lastName: editingUser.lastName || '',
                phoneNumber: editingUser.phoneNumber || '',
                role: editingUser.role
              } : undefined}
              includeRole={true}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </AdminLayout>
  );
} 