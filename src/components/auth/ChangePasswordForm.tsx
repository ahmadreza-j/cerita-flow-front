import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import api from "../../utils/api";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  currentPassword: Yup.string()
    .required("رمز عبور فعلی الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
  newPassword: Yup.string()
    .required("رمز عبور جدید الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد")
    .notOneOf([Yup.ref('currentPassword')], 'رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد'),
  confirmPassword: Yup.string()
    .required("تکرار رمز عبور الزامی است")
    .oneOf([Yup.ref('newPassword')], 'تکرار رمز عبور با رمز عبور جدید مطابقت ندارد'),
});

const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePasswordVisibility = (field: string) => {
    switch (field) {
      case 'currentPassword':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'newPassword':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirmPassword':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(null);
        
        await api.post('/api/auth/change-password', {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        
        setSuccess('رمز عبور با موفقیت تغییر یافت');
        formik.resetForm();
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("خطا در تغییر رمز عبور");
        }
      }
    },
  });

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight="bold" color="primary">
        تغییر رمز عبور
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          id="currentPassword"
          name="currentPassword"
          label="رمز عبور فعلی"
          type={showCurrentPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={formik.values.currentPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
          helperText={formik.touched.currentPassword && formik.errors.currentPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleTogglePasswordVisibility('currentPassword')}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          fullWidth
          id="newPassword"
          name="newPassword"
          label="رمز عبور جدید"
          type={showNewPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
          helperText={formik.touched.newPassword && formik.errors.newPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleTogglePasswordVisibility('newPassword')}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="تکرار رمز عبور جدید"
          type={showConfirmPassword ? "text" : "password"}
          variant="outlined"
          margin="normal"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleTogglePasswordVisibility('confirmPassword')}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
          {formik.isSubmitting ? "در حال پردازش..." : "تغییر رمز عبور"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChangePasswordForm; 