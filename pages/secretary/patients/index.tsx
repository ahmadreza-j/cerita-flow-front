import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';
import SecretaryLayout from '../../../src/components/layout/SecretaryLayout';
import { formatPersianDate } from '../../../src/utils/dateUtils';

interface Patient {
  id: number;
  fileNumber: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  phone?: string;
  registrationDate: string;
}

const PatientsPage: React.FC = () => {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);

  useEffect(() => {
    // Fetch recent patients on component mount
    const fetchRecentPatients = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/patients/recent');
        setRecentPatients(response.data.patients || []);
      } catch (err) {
        console.error('Failed to fetch recent patients:', err);
        setError('خطا در دریافت اطلاعات بیماران اخیر');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPatients();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/patients/search?query=${searchTerm}`);
      setSearchResults(response.data.patients || []);
      
      if (response.data.patients.length === 0) {
        setError('هیچ بیماری با این مشخصات یافت نشد');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('خطا در جستجوی بیماران');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (!event.target.value.trim()) {
      setSearchResults([]);
      setError(null);
    }
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddVisit = async (patientId: number) => {
    try {
      const visitData = {
        patientId
      };
      
      const response = await axios.post('/api/visits', visitData);
      
      // Navigate to the patient file view
      router.push(`/secretary/patients/${patientId}`);
    } catch (err) {
      console.error('Failed to add visit:', err);
      setError('خطا در ثبت مراجعه جدید');
    }
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male':
        return 'مرد';
      case 'female':
        return 'زن';
      case 'other':
        return 'سایر';
      default:
        return 'نامشخص';
    }
  };

  const renderPatientTable = (patientsData: Patient[], title: string) => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شماره پرونده</TableCell>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell>سن</TableCell>
              <TableCell>جنسیت</TableCell>
              <TableCell>تاریخ ثبت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patientsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  هیچ بیماری یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              patientsData.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.fileNumber}</TableCell>
                  <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{patient.nationalId}</TableCell>
                  <TableCell>{patient.age || 'نامشخص'}</TableCell>
                  <TableCell>{getGenderLabel(patient.gender)}</TableCell>
                  <TableCell>{patient.registrationDate}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => router.push(`/secretary/patients/${patient.id}`)}
                      title="مشاهده پرونده"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => router.push(`/secretary/patients/${patient.id}/edit`)}
                      title="ویرایش اطلاعات"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleAddVisit(patient.id)}
                      title="ثبت مراجعه جدید"
                    >
                      <EventNoteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <SecretaryLayout>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1">
            مدیریت بیماران
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/secretary/patients/new')}
          >
            ثبت بیمار جدید
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            جستجوی بیمار
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="جستجو بر اساس نام، نام خانوادگی، کد ملی یا شماره پرونده..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? <CircularProgress size={24} /> : 'جستجو'}
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          {searchResults.length > 0 && renderPatientTable(searchResults, 'نتایج جستجو')}
          
          {searchResults.length === 0 && recentPatients.length > 0 && renderPatientTable(recentPatients, 'بیماران اخیر')}
        </Paper>
      </Box>
    </SecretaryLayout>
  );
};

export default PatientsPage; 