import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

interface ExaminationFormProps {
  patientName: string;
  fileNumber: string;
  visitId: number;
  initialValues?: ExaminationFormValues;
  onSubmit: (values: ExaminationFormValues) => void;
  onCancel: () => void;
}

export interface ExaminationFormValues {
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  rightVa: string;
  rightAdd: string;
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
  leftVa: string;
  leftAdd: string;
  pd: string;
  nearPd: string;
  needsGlasses: boolean;
  needsReferral: boolean;
  needsSpecialCare: boolean;
  notes: string;
}

const defaultInitialValues: ExaminationFormValues = {
  rightSphere: '',
  rightCylinder: '',
  rightAxis: '',
  rightVa: '',
  rightAdd: '',
  leftSphere: '',
  leftCylinder: '',
  leftAxis: '',
  leftVa: '',
  leftAdd: '',
  pd: '',
  nearPd: '',
  needsGlasses: false,
  needsReferral: false,
  needsSpecialCare: false,
  notes: ''
};

const validationSchema = Yup.object({
  rightSphere: Yup.string().matches(/^-?\d*\.?\d*$/, 'باید عدد باشد'),
  rightCylinder: Yup.string().matches(/^-?\d*\.?\d*$/, 'باید عدد باشد'),
  rightAxis: Yup.string().matches(/^\d*$/, 'باید عدد صحیح باشد'),
  rightVa: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  rightAdd: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  leftSphere: Yup.string().matches(/^-?\d*\.?\d*$/, 'باید عدد باشد'),
  leftCylinder: Yup.string().matches(/^-?\d*\.?\d*$/, 'باید عدد باشد'),
  leftAxis: Yup.string().matches(/^\d*$/, 'باید عدد صحیح باشد'),
  leftVa: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  leftAdd: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  pd: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  nearPd: Yup.string().matches(/^\d*\.?\d*$/, 'باید عدد باشد'),
  notes: Yup.string()
});

const ExaminationForm: React.FC<ExaminationFormProps> = ({
  patientName,
  fileNumber,
  visitId,
  initialValues = defaultInitialValues,
  onSubmit,
  onCancel
}) => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          فرم معاینه بیمار
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          بیمار: {patientName} | شماره پرونده: {fileNumber}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  اطلاعات نمره چشم
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  چشم راست
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="rightSphere"
                      name="rightSphere"
                      label="Sphere"
                      value={values.rightSphere}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.rightSphere && Boolean(errors.rightSphere)}
                      helperText={touched.rightSphere && errors.rightSphere}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="rightCylinder"
                      name="rightCylinder"
                      label="Cylinder"
                      value={values.rightCylinder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.rightCylinder && Boolean(errors.rightCylinder)}
                      helperText={touched.rightCylinder && errors.rightCylinder}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="rightAxis"
                      name="rightAxis"
                      label="Axis"
                      value={values.rightAxis}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.rightAxis && Boolean(errors.rightAxis)}
                      helperText={touched.rightAxis && errors.rightAxis}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="rightVa"
                      name="rightVa"
                      label="VA"
                      value={values.rightVa}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.rightVa && Boolean(errors.rightVa)}
                      helperText={touched.rightVa && errors.rightVa}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="rightAdd"
                      name="rightAdd"
                      label="Add"
                      value={values.rightAdd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.rightAdd && Boolean(errors.rightAdd)}
                      helperText={touched.rightAdd && errors.rightAdd}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  چشم چپ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="leftSphere"
                      name="leftSphere"
                      label="Sphere"
                      value={values.leftSphere}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.leftSphere && Boolean(errors.leftSphere)}
                      helperText={touched.leftSphere && errors.leftSphere}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="leftCylinder"
                      name="leftCylinder"
                      label="Cylinder"
                      value={values.leftCylinder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.leftCylinder && Boolean(errors.leftCylinder)}
                      helperText={touched.leftCylinder && errors.leftCylinder}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="leftAxis"
                      name="leftAxis"
                      label="Axis"
                      value={values.leftAxis}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.leftAxis && Boolean(errors.leftAxis)}
                      helperText={touched.leftAxis && errors.leftAxis}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="leftVa"
                      name="leftVa"
                      label="VA"
                      value={values.leftVa}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.leftVa && Boolean(errors.leftVa)}
                      helperText={touched.leftVa && errors.leftVa}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="leftAdd"
                      name="leftAdd"
                      label="Add"
                      value={values.leftAdd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.leftAdd && Boolean(errors.leftAdd)}
                      helperText={touched.leftAdd && errors.leftAdd}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  اطلاعات تکمیلی
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="pd"
                      name="pd"
                      label="PD"
                      value={values.pd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.pd && Boolean(errors.pd)}
                      helperText={touched.pd && errors.pd}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="nearPd"
                      name="nearPd"
                      label="Near PD"
                      value={values.nearPd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nearPd && Boolean(errors.nearPd)}
                      helperText={touched.nearPd && errors.nearPd}
                      size="small"
                      dir="ltr"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  توصیه‌ها
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="needsGlasses"
                          name="needsGlasses"
                          checked={values.needsGlasses}
                          onChange={handleChange}
                        />
                      }
                      label="نیاز به عینک دارد"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="needsReferral"
                          name="needsReferral"
                          checked={values.needsReferral}
                          onChange={handleChange}
                        />
                      }
                      label="نیاز به ارجاع به چشم پزشک دارد"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="needsSpecialCare"
                          name="needsSpecialCare"
                          checked={values.needsSpecialCare}
                          onChange={handleChange}
                        />
                      }
                      label="نیاز به مراقبت خاص دارد"
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="توضیحات و یادداشت‌ها"
                  multiline
                  rows={4}
                  value={values.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={touched.notes && errors.notes}
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
                    disabled={isSubmitting}
                  >
                    ثبت معاینه
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default ExaminationForm; 