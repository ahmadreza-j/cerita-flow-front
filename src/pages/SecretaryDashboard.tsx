import { useState } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const validationSchema = Yup.object({
  nationalId: Yup.string()
    .required('کد ملی الزامی است')
    .matches(/^[0-9]{10}$/, 'کد ملی باید 10 رقم باشد'),
  firstName: Yup.string().required('نام الزامی است'),
  lastName: Yup.string().required('نام خانوادگی الزامی است'),
  age: Yup.number()
    .required('سن الزامی است')
    .min(0, 'سن نمیتواند منفی باشد')
    .max(150, 'سن نامعتبر است'),
  occupation: Yup.string(),
  address: Yup.string(),
  referralSource: Yup.string(),
});

const SecretaryDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/patients/search?q=${searchQuery}`);
      if (!response.ok) {
        throw new Error('خطا در جستجوی بیمار');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      nationalId: '',
      firstName: '',
      lastName: '',
      age: '',
      occupation: '',
      address: '',
      referralSource: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('خطا در ثبت بیمار جدید');
        }

        // Reset form and show success message
        formik.resetForm();
        // TODO: Show success message
      } catch (error) {
        console.error('Error creating patient:', error);
        // TODO: Show error message
      }
    },
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="secretary dashboard tabs"
          centered
        >
          <Tab label="جستجوی پرونده" />
          <Tab label="ثبت پرونده جدید" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  label="جستجو بر اساس کد ملی، نام یا نام خانوادگی"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  sx={{ height: '56px' }}
                >
                  جستجو
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Search Results */}
          {searchResults.map((patient) => (
            <Paper key={patient.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">
                {patient.firstName} {patient.lastName}
              </Typography>
              <Typography>کد ملی: {patient.nationalId}</Typography>
              <Button variant="outlined" sx={{ mt: 1 }}>
                مشاهده پرونده
              </Button>
            </Paper>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="nationalId"
                  name="nationalId"
                  label="کد ملی"
                  value={formik.values.nationalId}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.nationalId && Boolean(formik.errors.nationalId)
                  }
                  helperText={formik.touched.nationalId && formik.errors.nationalId}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="نام"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="نام خانوادگی"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="age"
                  name="age"
                  label="سن"
                  type="number"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  error={formik.touched.age && Boolean(formik.errors.age)}
                  helperText={formik.touched.age && formik.errors.age}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="occupation"
                  name="occupation"
                  label="شغل"
                  value={formik.values.occupation}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  id="referralSource"
                  name="referralSource"
                  label="نحوه آشنایی"
                  value={formik.values.referralSource}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  name="address"
                  label="آدرس"
                  multiline
                  rows={3}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  ثبت پرونده
                </Button>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SecretaryDashboard; 