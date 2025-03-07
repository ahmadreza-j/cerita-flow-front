import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';

interface Product {
  id: number;
  code: string;
  name: string;
  type: string;
  brand?: string;
  sellingPrice: number;
  quantity: number;
}

interface SaleItem {
  productId: number;
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface SaleFormValues {
  patientId: number;
  visitId: number;
  items: SaleItem[];
  discountAmount: number;
  paymentMethod: 'cash' | 'card' | 'insurance';
  insuranceProvider?: string;
  insuranceNumber?: string;
  notes?: string;
}

interface SaleFormProps {
  patientName: string;
  fileNumber: string;
  patientId: number;
  visitId: number;
  prescriptionData?: {
    rightSphere?: number;
    rightCylinder?: number;
    rightAxis?: number;
    leftSphere?: number;
    leftCylinder?: number;
    leftAxis?: number;
    pd?: number;
  };
  products: Product[];
  onSubmit: (values: SaleFormValues) => void;
  onCancel: () => void;
}

const defaultInitialValues: SaleFormValues = {
  patientId: 0,
  visitId: 0,
  items: [],
  discountAmount: 0,
  paymentMethod: 'cash',
  notes: ''
};

const validationSchema = Yup.object({
  items: Yup.array().of(
    Yup.object().shape({
      productId: Yup.number().required('انتخاب محصول الزامی است'),
      quantity: Yup.number().min(1, 'حداقل تعداد 1 است').required('تعداد الزامی است')
    })
  ).min(1, 'حداقل یک محصول باید انتخاب شود'),
  discountAmount: Yup.number().min(0, 'مقدار تخفیف نمی‌تواند منفی باشد'),
  paymentMethod: Yup.string().required('روش پرداخت الزامی است'),
  insuranceProvider: Yup.string().when('paymentMethod', {
    is: 'insurance',
    then: Yup.string().required('نام بیمه الزامی است')
  }),
  insuranceNumber: Yup.string().when('paymentMethod', {
    is: 'insurance',
    then: Yup.string().required('شماره بیمه الزامی است')
  })
});

const SaleForm: React.FC<SaleFormProps> = ({
  patientName,
  fileNumber,
  patientId,
  visitId,
  prescriptionData,
  products,
  onSubmit,
  onCancel
}) => {
  const initialValues: SaleFormValues = {
    ...defaultInitialValues,
    patientId,
    visitId
  };

  const calculateTotalAmount = (items: SaleItem[]) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateFinalAmount = (totalAmount: number, discountAmount: number) => {
    return Math.max(0, totalAmount - discountAmount);
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'frame':
        return 'primary';
      case 'lens':
        return 'secondary';
      case 'contact_lens':
        return 'info';
      case 'solution':
        return 'success';
      case 'accessory':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getProductTypeLabel = (type: string) => {
    switch (type) {
      case 'frame':
        return 'فریم';
      case 'lens':
        return 'عدسی';
      case 'contact_lens':
        return 'لنز تماسی';
      case 'solution':
        return 'محلول';
      case 'accessory':
        return 'لوازم جانبی';
      default:
        return type;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          فرم ثبت فروش
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          بیمار: {patientName} | شماره پرونده: {fileNumber}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      {prescriptionData && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            اطلاعات نسخه
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                چشم راست: {prescriptionData.rightSphere || 0} {prescriptionData.rightCylinder && prescriptionData.rightCylinder >= 0 ? '+' : ''}{prescriptionData.rightCylinder || 0}x{prescriptionData.rightAxis || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2">
                چشم چپ: {prescriptionData.leftSphere || 0} {prescriptionData.leftCylinder && prescriptionData.leftCylinder >= 0 ? '+' : ''}{prescriptionData.leftCylinder || 0}x{prescriptionData.leftAxis || 0}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                PD: {prescriptionData.pd || 'ثبت نشده'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          const totalAmount = calculateTotalAmount(values.items);
          const finalAmount = calculateFinalAmount(totalAmount, values.discountAmount);
          onSubmit({
            ...values,
            items: values.items.map(item => ({
              ...item,
              totalPrice: item.quantity * item.unitPrice
            }))
          });
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => {
          const totalAmount = calculateTotalAmount(values.items);
          const finalAmount = calculateFinalAmount(totalAmount, values.discountAmount);

          return (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    اقلام فروش
                  </Typography>
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <>
                        <TableContainer sx={{ mb: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>محصول</TableCell>
                                <TableCell>نوع</TableCell>
                                <TableCell>قیمت واحد (ریال)</TableCell>
                                <TableCell>تعداد</TableCell>
                                <TableCell>قیمت کل (ریال)</TableCell>
                                <TableCell>عملیات</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {values.items.length > 0 ? (
                                values.items.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        color={getProductTypeColor(item.productType) as any}
                                        label={getProductTypeLabel(item.productType)}
                                      />
                                    </TableCell>
                                    <TableCell>{item.unitPrice.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <TextField
                                        name={`items.${index}.quantity`}
                                        type="number"
                                        size="small"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const quantity = parseInt(e.target.value) || 0;
                                          handleChange(e);
                                          setFieldValue(
                                            `items.${index}.totalPrice`,
                                            quantity * item.unitPrice
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        error={
                                          touched.items?.[index]?.quantity &&
                                          Boolean(errors.items?.[index]?.quantity)
                                        }
                                        helperText={
                                          touched.items?.[index]?.quantity &&
                                          errors.items?.[index]?.quantity
                                        }
                                        inputProps={{ min: 1 }}
                                        sx={{ width: '80px' }}
                                      />
                                    </TableCell>
                                    <TableCell>{item.totalPrice.toLocaleString()}</TableCell>
                                    <TableCell>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => remove(index)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} align="center">
                                    هیچ محصولی انتخاب نشده است
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Box sx={{ mb: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel id="product-select-label">افزودن محصول</InputLabel>
                            <Select
                              labelId="product-select-label"
                              id="product-select"
                              label="افزودن محصول"
                              value=""
                              onChange={(e) => {
                                const productId = Number(e.target.value);
                                const product = products.find(p => p.id === productId);
                                if (product) {
                                  push({
                                    productId,
                                    productName: product.name,
                                    productType: product.type,
                                    quantity: 1,
                                    unitPrice: product.sellingPrice,
                                    totalPrice: product.sellingPrice
                                  });
                                }
                              }}
                            >
                              {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name} - {getProductTypeLabel(product.type)} - {product.sellingPrice.toLocaleString()} ریال
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </>
                    )}
                  </FieldArray>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    اطلاعات پرداخت
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="totalAmount"
                    name="totalAmount"
                    label="مبلغ کل (ریال)"
                    value={totalAmount.toLocaleString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="discountAmount"
                    name="discountAmount"
                    label="مبلغ تخفیف (ریال)"
                    type="number"
                    value={values.discountAmount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.discountAmount && Boolean(errors.discountAmount)}
                    helperText={touched.discountAmount && errors.discountAmount}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    id="finalAmount"
                    name="finalAmount"
                    label="مبلغ نهایی (ریال)"
                    value={finalAmount.toLocaleString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="payment-method-label">روش پرداخت</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      id="paymentMethod"
                      name="paymentMethod"
                      value={values.paymentMethod}
                      label="روش پرداخت"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                    >
                      <MenuItem value="cash">نقدی</MenuItem>
                      <MenuItem value="card">کارت بانکی</MenuItem>
                      <MenuItem value="insurance">بیمه</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {values.paymentMethod === 'insurance' && (
                  <>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id="insuranceProvider"
                        name="insuranceProvider"
                        label="نام بیمه"
                        value={values.insuranceProvider || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.insuranceProvider && Boolean(errors.insuranceProvider)}
                        helperText={touched.insuranceProvider && errors.insuranceProvider}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        id="insuranceNumber"
                        name="insuranceNumber"
                        label="شماره بیمه"
                        value={values.insuranceNumber || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.insuranceNumber && Boolean(errors.insuranceNumber)}
                        helperText={touched.insuranceNumber && errors.insuranceNumber}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="توضیحات"
                    multiline
                    rows={3}
                    value={values.notes || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={onCancel}
                      sx={{ ml: 2 }}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || values.items.length === 0}
                    >
                      ثبت فروش
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default SaleForm; 