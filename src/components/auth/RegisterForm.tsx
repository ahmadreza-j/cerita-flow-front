import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegisterData } from "../../types/auth";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface RegisterFormProps {
  onSubmit: (values: RegisterData) => Promise<void>;
}

const validationSchema = Yup.object({
  username: Yup.string()
    .required("نام کاربری الزامی است")
    .min(3, "نام کاربری باید حداقل 3 کاراکتر باشد"),
  email: Yup.string()
    .email("ایمیل نامعتبر است")
    .required("ایمیل الزامی است"),
  password: Yup.string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
  firstName: Yup.string().optional(),
  lastName: Yup.string().optional(),
  phoneNumber: Yup.string().optional(),
});

const RegisterForm = ({ onSubmit }: RegisterFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await onSubmit(values);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در ثبت‌نام");
      }
    },
  });

  // Common TextField styling
  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.5,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'primary.main',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      }
    },
    '& .MuiInputLabel-root': {
      color: 'text.primary',
      '&.Mui-focused': {
        color: 'primary.main',
      }
    },
    '& .MuiInputBase-input': {
      color: 'text.primary',
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        ثبت‌نام در سیستم
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 1,
            '& .MuiAlert-icon': { 
              alignItems: 'center' 
            }
          }}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="نام کاربری"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="نام"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="نام خانوادگی"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="ایمیل"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="شماره تلفن"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="رمز عبور"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      color="primary"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldSx}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={formik.isSubmitting}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 1.5,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: "bold",
            boxShadow: 2,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)',
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
            }
          }}
        >
          {formik.isSubmitting ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
          ) : null}
          {formik.isSubmitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterForm; 