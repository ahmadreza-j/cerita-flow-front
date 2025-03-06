import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  Autocomplete,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { formatNumber } from "../../utils/numberUtils";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  brand: string;
  sellingPrice: number;
  quantity: number;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
}

interface SaleItem {
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

const validationSchema = yup.object({
  patientId: yup.number().required("انتخاب بیمار الزامی است"),
  items: yup.array().min(1, "حداقل یک محصول باید انتخاب شود"),
  paymentMethod: yup.string().required("روش پرداخت الزامی است"),
});

const paymentMethods = [
  { value: "cash", label: "نقدی" },
  { value: "card", label: "کارت" },
  { value: "pos", label: "دستگاه کارتخوان" },
];

const SalesManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery(
    ["products", searchTerm],
    async () => {
      const res = await axios.get("/api/products", {
        params: { search: searchTerm },
      });
      return res.data;
    }
  );

  const { data: patients = [] } = useQuery("patients", async () => {
    const res = await axios.get("/api/patients");
    return res.data;
  });

  const { data: salesStats } = useQuery(
    ["salesStats", startDate, endDate],
    async () => {
      if (!startDate || !endDate) return null;
      const res = await axios.get("/api/sales/daily-stats", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return res.data;
    },
    { enabled: Boolean(startDate && endDate) }
  );

  const { data: topProducts } = useQuery(
    ["topProducts", startDate, endDate],
    async () => {
      if (!startDate || !endDate) return null;
      const res = await axios.get("/api/sales/top-products", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return res.data;
    },
    { enabled: Boolean(startDate && endDate) }
  );

  const createSale = useMutation(
    (saleData: any) => axios.post("/api/sales", saleData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sales");
        setSnackbar({
          open: true,
          message: "فروش با موفقیت ثبت شد",
          severity: "success",
        });
        setSaleItems([]);
        formik.resetForm();
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در ثبت فروش",
          severity: "error",
        });
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      patientId: "",
      paymentMethod: "",
      discountAmount: 0,
    },
    validationSchema,
    onSubmit: (values) => {
      const totalAmount = saleItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      const finalAmount = totalAmount - values.discountAmount;

      createSale.mutate({
        patientId: values.patientId,
        paymentMethod: values.paymentMethod,
        totalAmount,
        discountAmount: values.discountAmount,
        finalAmount,
        items: saleItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    },
  });

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const existingItem = saleItems.find(
      (item) => item.productId === selectedProduct.id
    );
    if (existingItem) {
      setSaleItems(
        saleItems.map((item) =>
          item.productId === selectedProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: selectedProduct.id,
          product: selectedProduct,
          quantity: 1,
          unitPrice: selectedProduct.sellingPrice,
        },
      ]);
    }
    setSelectedProduct(null);
    setOpenDialog(false);
  };

  const handleUpdateQuantity = (productId: number, change: number) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: number) => {
    setSaleItems(saleItems.filter((item) => item.productId !== productId));
  };

  const totalAmount = saleItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const finalAmount = totalAmount - formik.values.discountAmount;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Sales Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ثبت فروش جدید
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete<Patient>
                    options={patients}
                    getOptionLabel={(option: Patient) =>
                      `${option.firstName} ${option.lastName} - ${option.nationalId}`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="انتخاب بیمار"
                        error={
                          formik.touched.patientId &&
                          Boolean(formik.errors.patientId)
                        }
                        helperText={
                          formik.touched.patientId && formik.errors.patientId
                        }
                      />
                    )}
                    onChange={(_, value) =>
                      formik.setFieldValue("patientId", value?.id || "")
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    fullWidth
                  >
                    افزودن محصول
                  </Button>
                </Grid>
                {saleItems.length > 0 && (
                  <Grid item xs={12}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>نام محصول</TableCell>
                            <TableCell>قیمت واحد</TableCell>
                            <TableCell>تعداد</TableCell>
                            <TableCell>قیمت کل</TableCell>
                            <TableCell>عملیات</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {saleItems.map((item) => (
                            <TableRow key={item.productId}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell>
                                {formatNumber(item.unitPrice)} ریال
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleUpdateQuantity(item.productId, -1)
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                  {item.quantity}
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleUpdateQuantity(item.productId, 1)
                                    }
                                    disabled={
                                      item.quantity >= item.product.quantity
                                    }
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {formatNumber(item.quantity * item.unitPrice)}{" "}
                                ریال
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleRemoveItem(item.productId)
                                  }
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    name="paymentMethod"
                    label="روش پرداخت"
                    value={formik.values.paymentMethod}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.paymentMethod &&
                      Boolean(formik.errors.paymentMethod)
                    }
                    helperText={
                      formik.touched.paymentMethod &&
                      formik.errors.paymentMethod
                    }
                  >
                    {paymentMethods.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="discountAmount"
                    label="مبلغ تخفیف (ریال)"
                    value={formik.values.discountAmount}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography>
                      مبلغ کل: {formatNumber(totalAmount)} ریال
                    </Typography>
                    <Typography>
                      مبلغ نهایی: {formatNumber(finalAmount)} ریال
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={saleItems.length === 0}
                      startIcon={<ReceiptIcon />}
                    >
                      ثبت فروش
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Sales Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              گزارش فروش
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DatePicker
                  label="از تاریخ"
                  value={startDate}
                  onChange={setStartDate}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="تا تاریخ"
                  value={endDate}
                  onChange={setEndDate}
                />
              </Grid>
            </Grid>
            {salesStats && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  آمار فروش
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={salesStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalAmount"
                      name="مبلغ فروش"
                      stroke="#8884d8"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      name="تعداد فروش"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
            {topProducts && (
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  محصولات پرفروش
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>نام محصول</TableCell>
                        <TableCell>تعداد فروش</TableCell>
                        <TableCell>مبلغ کل</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.totalQuantity}</TableCell>
                          <TableCell>
                            {formatNumber(product.totalAmount)} ریال
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Product Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>افزودن محصول</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete<Product>
              options={products}
              getOptionLabel={(option: Product) =>
                `${option.name} - ${option.brand}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="جستجوی محصول"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              value={selectedProduct}
              onChange={(_, value) => setSelectedProduct(value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>انصراف</Button>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            color="primary"
            disabled={!selectedProduct}
          >
            افزودن
          </Button>
        </DialogActions>
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

export default SalesManagement;
