import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import axios from "axios";
import { useRouter } from "next/router";

interface Patient {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  age?: number;
  phone?: string;
  lastVisit?: string;
}

const PatientsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery(
    ["patients", searchTerm],
    async () => {
      const res = await axios.get("/api/patients", {
        params: { search: searchTerm },
      });
      return res.data;
    }
  );

  const handleAddPatient = () => {
    router.push("/patients/new");
  };

  const handleEditPatient = (id: number) => {
    router.push(`/patients/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          لیست بیماران
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          افزودن بیمار جدید
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="جستجو در بیماران..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>کد ملی</TableCell>
                <TableCell>نام</TableCell>
                <TableCell>نام خانوادگی</TableCell>
                <TableCell>سن</TableCell>
                <TableCell>شماره تماس</TableCell>
                <TableCell>آخرین ویزیت</TableCell>
                <TableCell>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient: Patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.nationalId}</TableCell>
                  <TableCell>{patient.firstName}</TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>{patient.age || "-"}</TableCell>
                  <TableCell>{patient.phone || "-"}</TableCell>
                  <TableCell>
                    {patient.lastVisit
                      ? new Date(patient.lastVisit).toLocaleDateString("fa-IR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditPatient(patient.id)}>
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

export default PatientsPage;
