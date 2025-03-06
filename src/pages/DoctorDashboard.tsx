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
  FormControlLabel,
  Switch,
  Grid,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface Visit {
  id: number;
  patientId: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  visitDate: string;
  status: string;
}

interface ExaminationData {
  visualAcuityRight: string;
  visualAcuityLeft: string;
  prescriptionNeeded: boolean;
  rightEyeSphere: number;
  rightEyeCylinder: number;
  rightEyeAxis: number;
  leftEyeSphere: number;
  leftEyeCylinder: number;
  leftEyeAxis: number;
  doctorNotes: string;
}

const validationSchema = Yup.object({
  visualAcuityRight: Yup.string().required("دید چشم راست الزامی است"),
  visualAcuityLeft: Yup.string().required("دید چشم چپ الزامی است"),
  rightEyeSphere: Yup.number().required("اسفر چشم راست الزامی است"),
  rightEyeCylinder: Yup.number().required("سیلندر چشم راست الزامی است"),
  rightEyeAxis: Yup.number()
    .min(0, "محور باید بین 0 و 180 باشد")
    .max(180, "محور باید بین 0 و 180 باشد")
    .required("محور چشم راست الزامی است"),
  leftEyeSphere: Yup.number().required("اسفر چشم چپ الزامی است"),
  leftEyeCylinder: Yup.number().required("سیلندر چشم چپ الزامی است"),
  leftEyeAxis: Yup.number()
    .min(0, "محور باید بین 0 و 180 باشد")
    .max(180, "محور باید بین 0 و 180 باشد")
    .required("محور چشم چپ الزامی است"),
  doctorNotes: Yup.string(),
});

const DoctorDashboard = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const response = await fetch("/api/visits/pending");
      if (!response.ok) {
        throw new Error("خطا در دریافت لیست ویزیت‌ها");
      }
      const data = await response.json();
      setVisits(data);
    } catch (error) {
      console.error("Error fetching visits:", error);
    }
  };

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setDialogOpen(true);
  };

  const formik = useFormik<ExaminationData>({
    initialValues: {
      visualAcuityRight: "",
      visualAcuityLeft: "",
      prescriptionNeeded: false,
      rightEyeSphere: 0,
      rightEyeCylinder: 0,
      rightEyeAxis: 0,
      leftEyeSphere: 0,
      leftEyeCylinder: 0,
      leftEyeAxis: 0,
      doctorNotes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!selectedVisit) return;

      try {
        const response = await fetch(
          `/api/visits/${selectedVisit.id}/examination`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          }
        );

        if (!response.ok) {
          throw new Error("خطا در ثبت معاینه");
        }

        setDialogOpen(false);
        fetchVisits();
      } catch (error) {
        console.error("Error submitting examination:", error);
      }
    },
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        لیست ویزیت‌های امروز
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell>ساعت مراجعه</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((visit) => (
              <TableRow key={visit.id}>
                <TableCell>
                  {visit.firstName} {visit.lastName}
                </TableCell>
                <TableCell>{visit.nationalId}</TableCell>
                <TableCell>{visit.visitDate}</TableCell>
                <TableCell>{visit.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleVisitClick(visit)}
                  >
                    ثبت معاینه
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
          ثبت معاینه - {selectedVisit?.firstName} {selectedVisit?.lastName}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="visualAcuityRight"
                  label="دید چشم راست"
                  value={formik.values.visualAcuityRight}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.visualAcuityRight &&
                    Boolean(formik.errors.visualAcuityRight)
                  }
                  helperText={
                    formik.touched.visualAcuityRight &&
                    formik.errors.visualAcuityRight
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="visualAcuityLeft"
                  label="دید چشم چپ"
                  value={formik.values.visualAcuityLeft}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.visualAcuityLeft &&
                    Boolean(formik.errors.visualAcuityLeft)
                  }
                  helperText={
                    formik.touched.visualAcuityLeft &&
                    formik.errors.visualAcuityLeft
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.prescriptionNeeded}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "prescriptionNeeded",
                          e.target.checked
                        )
                      }
                      name="prescriptionNeeded"
                    />
                  }
                  label="نیاز به عینک دارد"
                />
              </Grid>
              {formik.values.prescriptionNeeded && (
                <>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="rightEyeSphere"
                      label="اسفر چشم راست"
                      value={formik.values.rightEyeSphere}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.rightEyeSphere &&
                        Boolean(formik.errors.rightEyeSphere)
                      }
                      helperText={
                        formik.touched.rightEyeSphere &&
                        formik.errors.rightEyeSphere
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="rightEyeCylinder"
                      label="سیلندر چشم راست"
                      value={formik.values.rightEyeCylinder}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.rightEyeCylinder &&
                        Boolean(formik.errors.rightEyeCylinder)
                      }
                      helperText={
                        formik.touched.rightEyeCylinder &&
                        formik.errors.rightEyeCylinder
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="rightEyeAxis"
                      label="محور چشم راست"
                      value={formik.values.rightEyeAxis}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.rightEyeAxis &&
                        Boolean(formik.errors.rightEyeAxis)
                      }
                      helperText={
                        formik.touched.rightEyeAxis &&
                        formik.errors.rightEyeAxis
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="leftEyeSphere"
                      label="اسفر چشم چپ"
                      value={formik.values.leftEyeSphere}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.leftEyeSphere &&
                        Boolean(formik.errors.leftEyeSphere)
                      }
                      helperText={
                        formik.touched.leftEyeSphere &&
                        formik.errors.leftEyeSphere
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="leftEyeCylinder"
                      label="سیلندر چشم چپ"
                      value={formik.values.leftEyeCylinder}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.leftEyeCylinder &&
                        Boolean(formik.errors.leftEyeCylinder)
                      }
                      helperText={
                        formik.touched.leftEyeCylinder &&
                        formik.errors.leftEyeCylinder
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      name="leftEyeAxis"
                      label="محور چشم چپ"
                      value={formik.values.leftEyeAxis}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.leftEyeAxis &&
                        Boolean(formik.errors.leftEyeAxis)
                      }
                      helperText={
                        formik.touched.leftEyeAxis && formik.errors.leftEyeAxis
                      }
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="doctorNotes"
                  label="یادداشت‌های پزشک"
                  value={formik.values.doctorNotes}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>انصراف</Button>
            <Button type="submit" variant="contained" color="primary">
              ثبت معاینه
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;
