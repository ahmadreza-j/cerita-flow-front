import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string().required('نام کاربری الزامی است'),
  password: Yup.string().required('رمز عبور الزامی است'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // TODO: Implement login API call
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('نام کاربری یا رمز عبور اشتباه است');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Redirect based on user role
        switch (data.role) {
          case 'secretary':
            navigate('/secretary');
            break;
          case 'doctor':
            navigate('/doctor');
            break;
          case 'optician':
            navigate('/optician');
            break;
          default:
            setError('دسترسی غیر مجاز');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'خطا در ورود به سیستم');
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            ورود به سیستم
          </Typography>
          <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label="نام کاربری"
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              margin="normal"
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="رمز عبور"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              ورود
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 