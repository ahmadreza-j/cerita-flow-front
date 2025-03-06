import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Prescription {
  id: number;
  patientId: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  visitDate: string;
  rightEyeSphere: number;
  rightEyeCylinder: number;
  rightEyeAxis: number;
  leftEyeSphere: number;
  leftEyeCylinder: number;
  leftEyeAxis: number;
}

interface GlassesData {
  frameCode: string;
  lensType: string;
  lensFeatures: string;
  framePrice: number;
  lensPrice: number;
}

const validationSchema = Yup.object({
  frameCode: Yup.string().required("کد فریم الزامی است"),
  lensType: Yup.string().required("نوع لنز الزامی است"),
  lensFeatures: Yup.string(),
  framePrice: Yup.number()
    .required("قیمت فریم الزامی است")
    .min(0, "قیمت نمیتواند منفی باشد"),
  lensPrice: Yup.number()
    .required("قیمت لنز الزامی است")
    .min(0, "قیمت نمیتواند منفی باشد"),
});

const OpticianDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch("/api/prescriptions/daily");
      if (!response.ok) {
        throw new Error("خطا در دریافت لیست نسخه‌ها");
      }
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  const handlePrescriptionClick = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDialogOpen(true);
  };

  const formik = useFormik<GlassesData>({
    initialValues: {
      frameCode: "",
      lensType: "",
      lensFeatures: "",
      framePrice: 0,
      lensPrice: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedPrescription) return;

      try {
        const response = await fetch(`/api/glasses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            visitId: selectedPrescription.id,
          }),
        });

        if (!response.ok) {
          throw new Error("خطا در ثبت عینک");
        }

        setDialogOpen(false);
        fetchPrescriptions();
      } catch (error) {
        console.error("Error submitting glasses:", error);
      }
    },
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        لیست نسخه‌های امروز
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell>نمره چشم راست</TableCell>
              <TableCell>نمره چشم چپ</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell>
                  {prescription.firstName} {prescription.lastName}
                </TableCell>
                <TableCell>{prescription.nationalId}</TableCell>
                <TableCell>
                  {prescription.rightEyeSphere} /{" "}
                  {prescription.rightEyeCylinder} / {prescription.rightEyeAxis}
                </TableCell>
                <TableCell>
                  {prescription.leftEyeSphere} / {prescription.leftEyeCylinder}{" "}
                  / {prescription.leftEyeAxis}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePrescriptionClick(prescription)}
                  >
                    ثبت عینک
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          ثبت عینک - {selectedPrescription?.firstName}{" "}
          {selectedPrescription?.lastName}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="frameCode"
                  label="کد فریم"
                  value={formik.values.frameCode}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.frameCode && Boolean(formik.errors.frameCode)
                  }
                  helperText={
                    formik.touched.frameCode && formik.errors.frameCode
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lensType"
                  label="نوع لنز"
                  value={formik.values.lensType}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.lensType && Boolean(formik.errors.lensType)
                  }
                  helperText={formik.touched.lensType && formik.errors.lensType}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="lensFeatures"
                  label="ویژگی‌های لنز"
                  value={formik.values.lensFeatures}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="framePrice"
                  label="قیمت فریم (تومان)"
                  value={formik.values.framePrice}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.framePrice &&
                    Boolean(formik.errors.framePrice)
                  }
                  helperText={
                    formik.touched.framePrice && formik.errors.framePrice
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="lensPrice"
                  label="قیمت لنز (تومان)"
                  value={formik.values.lensPrice}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.lensPrice && Boolean(formik.errors.lensPrice)
                  }
                  helperText={
                    formik.touched.lensPrice && formik.errors.lensPrice
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  قیمت کل: {formik.values.framePrice + formik.values.lensPrice}{" "}
                  تومان
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button type="submit" variant="contained" color="primary">
              ثبت عینک
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default OpticianDashboard;
