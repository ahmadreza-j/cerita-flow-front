import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  EventNote as EventNoteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import SecretaryLayout from '../../../../src/components/layout/SecretaryLayout';
import api from '../../../../src/utils/api';
import { formatPersianDate } from '../../../../src/utils/dateUtils';

// Tab Panel Component
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
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Interface definitions
interface Patient {
  id: number;
  fileNumber: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  registrationDate: string;
}

interface Visit {
  id: number;
  visitDate: string;
  visitTime: string;
  status: string;
  doctorName?: string;
  diagnosis?: string;
  prescription?: string;
}

const PatientDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch patient details
        const patientResponse = await api.get(`/api/patients/${id}`);
        
        if (patientResponse.data) {
          const patientData = patientResponse.data;
          setPatient({
            id: patientData.id,
            fileNumber: patientData.file_number,
            nationalId: patientData.national_id,
            firstName: patientData.first_name,
            lastName: patientData.last_name,
            age: patientData.age,
            gender: patientData.gender,
            phone: patientData.phone,
            address: patientData.address,
            registrationDate: patientData.registration_date
          });
          
          // Fetch patient visits
          const visitsResponse = await api.get(`/api/patients/${id}/visits`);
          
          if (visitsResponse.data) {
            const visitsData = visitsResponse.data.map((visit: any) => ({
              id: visit.id,
              visitDate: visit.visit_date,
              visitTime: visit.visit_time,
              status: visit.status,
              doctorName: visit.doctor_first_name && visit.doctor_last_name 
                ? `${visit.doctor_first_name} ${visit.doctor_last_name}` 
                : 'نامشخص',
              diagnosis: visit.diagnosis,
              prescription: visit.prescription
            }));
            setVisits(visitsData);
          }
        } else {
          setError('اطلاعات بیمار یافت نشد');
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('خطا در دریافت اطلاعات بیمار');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddVisit = async () => {
    if (!patient) return;
    
    try {
      const visitData = {
        patientId: patient.id
      };
      
      await api.post('/api/visits', visitData);
      
      // Refresh visits
      const visitsResponse = await api.get(`/api/patients/${id}/visits`);
      
      if (visitsResponse.data) {
        const visitsData = visitsResponse.data.map((visit: any) => ({
          id: visit.id,
          visitDate: visit.visit_date,
          visitTime: visit.visit_time,
          status: visit.status,
          doctorName: visit.doctor_first_name && visit.doctor_last_name 
            ? `${visit.doctor_first_name} ${visit.doctor_last_name}` 
            : 'نامشخص',
          diagnosis: visit.diagnosis,
          prescription: visit.prescription
        }));
        setVisits(visitsData);
      }
    } catch (err) {
      console.error('Failed to add visit:', err);
      setError('خطا در ثبت مراجعه جدید');
    }
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'نامشخص';
    
    switch (gender.toLowerCase()) {
      case 'male':
      case 'مرد':
      case 'm':
        return 'مرد';
      case 'female':
      case 'زن':
      case 'f':
        return 'زن';
      case 'other':
      case 'سایر':
      case 'o':
        return 'سایر';
      default:
        return 'نامشخص';
    }
  };

  const getVisitStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'در انتظار';
      case 'in_progress':
        return 'در حال انجام';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SecretaryLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </SecretaryLayout>
    );
  }

  if (error || !patient) {
    return (
      <SecretaryLayout>
        <Box sx={{ mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/secretary/patients')}
            sx={{ mb: 2 }}
          >
            بازگشت به لیست بیماران
          </Button>
          <Alert severity="error">{error || 'اطلاعات بیمار یافت نشد'}</Alert>
        </Box>
      </SecretaryLayout>
    );
  }

  return (
    <SecretaryLayout>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/secretary/patients')}
          sx={{ mb: 2 }}
        >
          بازگشت به لیست بیماران
        </Button>

        <Paper elevation={2}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="div">
                پرونده بیمار: {patient.firstName} {patient.lastName}
              </Typography>
              <Typography variant="body2">
                شماره پرونده: {patient.fileNumber} | کد ملی: {patient.nationalId} | تاریخ ثبت: {patient.registrationDate}
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<EditIcon />}
                onClick={() => router.push(`/secretary/patients/${patient.id}/edit`)}
                sx={{ mr: 1 }}
              >
                ویرایش اطلاعات
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<EventNoteIcon />}
                onClick={handleAddVisit}
              >
                ثبت مراجعه جدید
              </Button>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient tabs">
              <Tab label="اطلاعات شخصی" />
              <Tab label="سوابق مراجعات" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">اطلاعات شخصی</Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">سن: {patient.age || 'ثبت نشده'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">جنسیت: {getGenderLabel(patient.gender)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">شماره تماس: {patient.phone || 'ثبت نشده'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">آدرس: {patient.address || 'ثبت نشده'}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              سوابق مراجعات
            </Typography>
            
            {visits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                هیچ مراجعه‌ای ثبت نشده است.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {visits.map((visit) => (
                  <Paper key={visit.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          تاریخ مراجعه:
                        </Typography>
                        <Typography variant="body1">
                          {visit.visitDate}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          ساعت مراجعه:
                        </Typography>
                        <Typography variant="body1">
                          {visit.visitTime}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          پزشک:
                        </Typography>
                        <Typography variant="body1">
                          {visit.doctorName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          وضعیت:
                        </Typography>
                        <Typography variant="body1">
                          {getVisitStatusLabel(visit.status)}
                        </Typography>
                      </Grid>
                      {visit.diagnosis && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            تشخیص:
                          </Typography>
                          <Typography variant="body1">
                            {visit.diagnosis}
                          </Typography>
                        </Grid>
                      )}
                      {visit.prescription && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            نسخه:
                          </Typography>
                          <Typography variant="body1">
                            {visit.prescription}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </SecretaryLayout>
  );
};

export default PatientDetailPage; 