import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { formatPersianDate } from '../../utils/dateUtils';

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

interface Visit {
  id: number;
  visitDate: string;
  visitTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  doctorFirstName?: string;
  doctorLastName?: string;
}

interface Examination {
  id: number;
  visitId: number;
  rightSphere?: number;
  rightCylinder?: number;
  rightAxis?: number;
  leftSphere?: number;
  leftCylinder?: number;
  leftAxis?: number;
  pd?: number;
  needsGlasses: boolean;
  needsReferral: boolean;
  examinationDate: string;
  notes?: string;
}

interface Sale {
  id: number;
  visitId: number;
  saleDate: string;
  totalAmount: number;
  finalAmount: number;
  items: SaleItem[];
}

interface SaleItem {
  id: number;
  productName: string;
  productType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Patient {
  id: number;
  fileNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: string;
  registrationDate: string;
}

interface PatientFileViewProps {
  patient: Patient;
  visits: Visit[];
  examinations: Examination[];
  sales: Sale[];
  onNewVisit?: () => void;
  onViewExamination?: (visitId: number) => void;
  onNewSale?: (visitId: number) => void;
}

const PatientFileView: React.FC<PatientFileViewProps> = ({
  patient,
  visits,
  examinations,
  sales,
  onNewVisit,
  onViewExamination,
  onNewSale
}) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let label = '';

    switch (status) {
      case 'pending':
        color = 'warning';
        label = 'در انتظار';
        break;
      case 'in_progress':
        color = 'info';
        label = 'در حال انجام';
        break;
      case 'completed':
        color = 'success';
        label = 'تکمیل شده';
        break;
      case 'cancelled':
        color = 'error';
        label = 'لغو شده';
        break;
      default:
        label = status;
    }

    return <Chip size="small" color={color} label={label} />;
  };

  return (
    <Paper elevation={2}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" component="div">
          پرونده بیمار: {patient.firstName} {patient.lastName}
        </Typography>
        <Typography variant="body2">
          شماره پرونده: {patient.fileNumber} | کد ملی: {patient.nationalId} | تاریخ ثبت: {patient.registrationDate}
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">اطلاعات شخصی</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">سن: {patient.age || 'ثبت نشده'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">جنسیت: {patient.gender === 'male' ? 'مرد' : patient.gender === 'female' ? 'زن' : 'ثبت نشده'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">شماره تماس: {patient.phone || 'ثبت نشده'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">آدرس: {patient.address || 'ثبت نشده'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">خلاصه پرونده</Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">تعداد مراجعات: {visits.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">تعداد معاینات: {examinations.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">تعداد خریدها: {sales.length}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">آخرین مراجعه: {visits.length > 0 ? visits[0].visitDate : 'ندارد'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient file tabs" centered>
          <Tab label="مراجعات" />
          <Tab label="معاینات" />
          <Tab label="خریدها" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={onNewVisit}>
            ثبت مراجعه جدید
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>تاریخ</TableCell>
                <TableCell>ساعت</TableCell>
                <TableCell>دکتر</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.length > 0 ? (
                visits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{visit.visitDate}</TableCell>
                    <TableCell>{visit.visitTime}</TableCell>
                    <TableCell>
                      {visit.doctorFirstName && visit.doctorLastName
                        ? `${visit.doctorFirstName} ${visit.doctorLastName}`
                        : 'تعیین نشده'}
                    </TableCell>
                    <TableCell>{getStatusChip(visit.status)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => onViewExamination && onViewExamination(visit.id)}
                      >
                        مشاهده
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    هیچ مراجعه‌ای ثبت نشده است
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>تاریخ</TableCell>
                <TableCell>نمره چشم راست</TableCell>
                <TableCell>نمره چشم چپ</TableCell>
                <TableCell>نیاز به عینک</TableCell>
                <TableCell>نیاز به ارجاع</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examinations.length > 0 ? (
                examinations.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.examinationDate}</TableCell>
                    <TableCell>
                      {exam.rightSphere !== undefined && exam.rightCylinder !== undefined
                        ? `${exam.rightSphere} ${exam.rightCylinder >= 0 ? '+' : ''}${exam.rightCylinder}x${exam.rightAxis || 0}`
                        : 'ثبت نشده'}
                    </TableCell>
                    <TableCell>
                      {exam.leftSphere !== undefined && exam.leftCylinder !== undefined
                        ? `${exam.leftSphere} ${exam.leftCylinder >= 0 ? '+' : ''}${exam.leftCylinder}x${exam.leftAxis || 0}`
                        : 'ثبت نشده'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={exam.needsGlasses ? 'primary' : 'default'}
                        label={exam.needsGlasses ? 'بله' : 'خیر'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={exam.needsReferral ? 'warning' : 'default'}
                        label={exam.needsReferral ? 'بله' : 'خیر'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => onViewExamination && onViewExamination(exam.visitId)}
                      >
                        مشاهده
                      </Button>
                      {exam.needsGlasses && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => onNewSale && onNewSale(exam.visitId)}
                          sx={{ ml: 1 }}
                        >
                          ثبت فروش
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    هیچ معاینه‌ای ثبت نشده است
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>تاریخ</TableCell>
                <TableCell>اقلام</TableCell>
                <TableCell>مبلغ کل</TableCell>
                <TableCell>مبلغ نهایی</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.saleDate}</TableCell>
                    <TableCell>
                      {sale.items.map((item) => (
                        <div key={item.id}>
                          {item.quantity} x {item.productName}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{sale.totalAmount.toLocaleString()} ریال</TableCell>
                    <TableCell>{sale.finalAmount.toLocaleString()} ریال</TableCell>
                    <TableCell>
                      <Button size="small">مشاهده فاکتور</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    هیچ خریدی ثبت نشده است
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Paper>
  );
};

export default PatientFileView; 