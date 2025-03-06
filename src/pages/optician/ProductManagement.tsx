import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Chip,
  Grid,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { formatNumber } from "../../utils/numberUtils";

interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  brand: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minQuantity: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const productTypes = [
  { value: "frame", label: "فریم" },
  { value: "lens", label: "عدسی" },
  { value: "contact_lens", label: "لنز تماسی" },
  { value: "accessory", label: "لوازم جانبی" },
];

const validationSchema = yup.object({
  code: yup.string().required("کد محصول الزامی است"),
  name: yup.string().required("نام محصول الزامی است"),
  type: yup.string().required("نوع محصول الزامی است"),
  brand: yup.string().required("برند محصول الزامی است"),
  description: yup.string(),
  purchasePrice: yup
    .number()
    .min(0, "قیمت خرید نامعتبر است")
    .required("قیمت خرید الزامی است"),
  sellingPrice: yup
    .number()
    .min(0, "قیمت فروش نامعتبر است")
    .required("قیمت فروش الزامی است"),
  quantity: yup
    .number()
    .min(0, "تعداد نامعتبر است")
    .required("تعداد الزامی است"),
  minQuantity: yup
    .number()
    .min(0, "حداقل موجودی نامعتبر است")
    .required("حداقل موجودی الزامی است"),
});

const ProductManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const queryClient = useQueryClient();

  const { data: productsData = [] } = useQuery(
    ["products", selectedTab, searchTerm],
    async () => {
      const params: any = {};
      if (selectedTab !== "all") params.type = selectedTab;
      if (searchTerm) params.search = searchTerm;
      const res = await axios.get("/api/products", { params });
      return res.data;
    }
  );

  // Update local state when query data changes
  useEffect(() => {
    setProducts(productsData);
  }, [productsData]);

  const createProduct = useMutation(
    (productData: any) => axios.post("/api/products", productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        setSnackbar({
          open: true,
          message: "محصول با موفقیت ایجاد شد",
          severity: "success",
        });
        handleCloseDialog();
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در ایجاد محصول",
          severity: "error",
        });
      },
    }
  );

  const updateProduct = useMutation(
    (productData: any) =>
      axios.put(`/api/products/${productData.id}`, productData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        setSnackbar({
          open: true,
          message: "محصول با موفقیت بروزرسانی شد",
          severity: "success",
        });
        handleCloseDialog();
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در بروزرسانی محصول",
          severity: "error",
        });
      },
    }
  );

  const deleteProduct = useMutation(
    (productId: number) => axios.delete(`/api/products/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("products");
        setSnackbar({
          open: true,
          message: "محصول با موفقیت حذف شد",
          severity: "success",
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در حذف محصول",
          severity: "error",
        });
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      code: "",
      name: "",
      type: "",
      brand: "",
      description: "",
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      minQuantity: 0,
    },
    validationSchema,
    onSubmit: (values) => {
      if (editingProduct) {
        updateProduct.mutate({ id: editingProduct.id, ...values });
      } else {
        createProduct.mutate(values);
      }
    },
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      formik.setValues(product);
    } else {
      setEditingProduct(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    formik.resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          مدیریت محصولات
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          افزودن محصول جدید
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab value="all" label="همه محصولات" />
        <Tab value="frame" label="فریم‌ها" />
        <Tab value="lens" label="عدسی‌ها" />
        <Tab value="contact_lens" label="لنزهای تماسی" />
        <Tab value="accessory" label="لوازم جانبی" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>کد</TableCell>
              <TableCell>نام</TableCell>
              <TableCell>برند</TableCell>
              <TableCell>نوع</TableCell>
              <TableCell>قیمت خرید</TableCell>
              <TableCell>قیمت فروش</TableCell>
              <TableCell>موجودی</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>
                  {productTypes.find((t) => t.value === product.type)?.label}
                </TableCell>
                <TableCell>
                  {formatNumber(product.purchasePrice)} ریال
                </TableCell>
                <TableCell>{formatNumber(product.sellingPrice)} ریال</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {product.quantity}
                    {product.quantity <= product.minQuantity && (
                      <Chip
                        icon={<WarningIcon />}
                        label="کمبود موجودی"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <span className={getStatusColor(product.status)}>
                    {product.status}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteProduct.mutate(product.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
          </DialogTitle>
          <DialogContent>
            <Box display="grid" gap={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                name="code"
                label="کد محصول"
                value={formik.values.code}
                onChange={formik.handleChange}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                disabled={Boolean(editingProduct)}
              />
              <TextField
                fullWidth
                name="name"
                label="نام محصول"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                select
                name="type"
                label="نوع محصول"
                value={formik.values.type}
                onChange={formik.handleChange}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              >
                {productTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                name="brand"
                label="برند"
                value={formik.values.brand}
                onChange={formik.handleChange}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                name="description"
                label="توضیحات"
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
              <TextField
                fullWidth
                type="number"
                name="purchasePrice"
                label="قیمت خرید (ریال)"
                value={formik.values.purchasePrice}
                onChange={formik.handleChange}
                error={
                  formik.touched.purchasePrice &&
                  Boolean(formik.errors.purchasePrice)
                }
                helperText={
                  formik.touched.purchasePrice && formik.errors.purchasePrice
                }
              />
              <TextField
                fullWidth
                type="number"
                name="sellingPrice"
                label="قیمت فروش (ریال)"
                value={formik.values.sellingPrice}
                onChange={formik.handleChange}
                error={
                  formik.touched.sellingPrice &&
                  Boolean(formik.errors.sellingPrice)
                }
                helperText={
                  formik.touched.sellingPrice && formik.errors.sellingPrice
                }
              />
              <TextField
                fullWidth
                type="number"
                name="quantity"
                label="موجودی"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                error={
                  formik.touched.quantity && Boolean(formik.errors.quantity)
                }
                helperText={formik.touched.quantity && formik.errors.quantity}
              />
              <TextField
                fullWidth
                type="number"
                name="minQuantity"
                label="حداقل موجودی"
                value={formik.values.minQuantity}
                onChange={formik.handleChange}
                error={
                  formik.touched.minQuantity &&
                  Boolean(formik.errors.minQuantity)
                }
                helperText={
                  formik.touched.minQuantity && formik.errors.minQuantity
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>انصراف</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingProduct ? "بروزرسانی" : "ایجاد"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManagement;
