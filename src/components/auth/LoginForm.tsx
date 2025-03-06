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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("ایمیل نامعتبر است")
    .required("ایمیل الزامی است"),
  password: Yup.string()
    .required("رمز عبور الزامی است")
    .min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await onSubmit(values);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در ورود به سیستم");
      }
    },
  });

  return (
    <Box sx={{ width: "100%" }}>
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
        <TextField
          margin="normal"
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
          sx={{
            mb: 2,
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
          }}
        />

        <TextField
          margin="normal"
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
          sx={{
            mb: 3,
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
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={formik.isSubmitting}
          sx={{
            mt: 1,
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
          {formik.isSubmitting ? "در حال ورود..." : "ورود به سیستم"}
        </Button>
      </form>
    </Box>
  );
};

export default LoginForm;
