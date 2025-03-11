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
  Paper,
  Grid,
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

// مدل داده محصول
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
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
    const fetchProducts = async () => {
      if (isAuthenticated && user?.role === Role.ADMIN) {
        try {
          setLoading(true);
          
          // دریافت لیست محصولات از API
          const response = await api.get('/api/products', {
            params: {
              category: categoryFilter
            }
          });
          
          setProducts(response.data.products || []);
          setTotalCount(response.data.totalCount || 0);
          
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProducts();
  }, [isAuthenticated, user, categoryFilter]);

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value);
  };

  const handleAddProduct = () => {
    router.push('/admin/products/new');
  };

  const handleViewProduct = (id: string) => {
    router.push(`/admin/products/${id}`);
  };

  const handleEditProduct = (id: string) => {
    router.push(`/admin/products/${id}/edit`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      try {
        await api.delete(`/api/products/${id}`);
        // بروزرسانی لیست محصولات پس از حذف
        setProducts(products.filter(product => product.id !== id));
        setTotalCount(prev => prev - 1);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('خطا در حذف محصول');
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // تبدیل وضعیت موجودی به رنگ
  const getStockStatusColor = (stock: number) => {
    if (stock <= 0) return 'error';
    if (stock < 10) return 'warning';
    return 'success';
  };

  // فرمت قیمت به تومان
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  // تبدیل دسته‌بندی به متن فارسی
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'lenses': return 'لنز';
      case 'frames': return 'فریم';
      case 'sunglasses': return 'عینک آفتابی';
      case 'accessories': return 'لوازم جانبی';
      case 'solutions': return 'محلول‌ها';
      default: return category;
    }
  };

  // تعریف ستون‌های جدول
  const columns = [
    { id: 'name', label: 'نام محصول', minWidth: 200 },
    { 
      id: 'category', 
      label: 'دسته‌بندی', 
      minWidth: 120,
      format: (value: string) => getCategoryText(value)
    },
    { id: 'brand', label: 'برند', minWidth: 120 },
    { 
      id: 'price', 
      label: 'قیمت', 
      minWidth: 150,
      format: (value: number) => formatPrice(value)
    },
    { 
      id: 'stock', 
      label: 'موجودی', 
      minWidth: 120,
      format: (value: number) => (
        <Chip 
          label={value > 0 ? `${value} عدد` : 'ناموجود'} 
          color={getStockStatusColor(value) as any}
          size="small"
        />
      )
    },
    { 
      id: 'actions', 
      label: 'عملیات', 
      minWidth: 120,
      format: (value: any, row: Product) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => handleViewProduct(row.id)}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton 
            color="secondary" 
            onClick={() => handleEditProduct(row.id)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeleteProduct(row.id)}
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
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : products;

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
            مدیریت محصولات
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
              onClick={handleAddProduct}
            >
              افزودن محصول جدید
            </Button>
          </Box>
        </Box>

        {showFilters && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">دسته‌بندی</InputLabel>
                  <Select<string>
                    labelId="category-filter-label"
                    value={categoryFilter}
                    label="دسته‌بندی"
                    onChange={handleCategoryFilterChange}
                  >
                    <MenuItem value="">همه</MenuItem>
                    <MenuItem value="lenses">لنز</MenuItem>
                    <MenuItem value="frames">فریم</MenuItem>
                    <MenuItem value="sunglasses">عینک آفتابی</MenuItem>
                    <MenuItem value="accessories">لوازم جانبی</MenuItem>
                    <MenuItem value="solutions">محلول‌ها</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

        <DataTable 
          columns={columns} 
          data={filteredData}
          title="لیست محصولات"
          searchPlaceholder="جستجو بر اساس نام، برند یا توضیحات محصول..."
          onSearch={handleSearch}
        />
      </Container>
    </AdminLayout>
  );
} 