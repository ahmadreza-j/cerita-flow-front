import React, { useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import moment from "moment-jalaali";
import MainLayout from "../../components/layout/MainLayout";
import DataTable from "../../components/common/DataTable";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";
import { Role } from "../../types/auth";

interface Visit {
  id: number;
  visit_time: string;
  national_id: string;
  first_name: string;
  last_name: string;
  status: string;
  doctor_name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const columns = [
  {
    id: "visit_time",
    label: "ساعت",
    minWidth: 70,
    format: (value: string) => value.substring(0, 5),
  },
  { id: "national_id", label: "کد ملی", minWidth: 100 },
  { id: "first_name", label: "نام", minWidth: 100 },
  { id: "last_name", label: "نام خانوادگی", minWidth: 100 },
  {
    id: "status",
    label: "وضعیت",
    minWidth: 100,
    format: (value: string) => {
      const statusMap: { [key: string]: string } = {
        pending: "در انتظار",
        in_progress: "در حال معاینه",
        completed: "تکمیل شده",
        cancelled: "لغو شده",
      };
      return statusMap[value] || value;
    },
  },
  { id: "doctor_name", label: "پزشک", minWidth: 120 },
];

const VisitsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const { data: visits, isLoading } = useQuery<Visit[]>(
    ["visits", selectedDate],
    async () => {
      const response = await axios.get(`${API_URL}/visits/daily`, {
        params: {
          date: selectedDate
            ? moment(selectedDate).format("YYYY-MM-DD")
            : undefined,
        },
      });
      return response.data;
    }
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleAddVisit = () => {
    router.push("/visits/new");
  };

  return (
    <MainLayout title="ویزیت‌های روزانه">
      <Box sx={{ mb: 4 }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} sm="auto">
            <Typography variant="h5" component="h1">
              لیست ویزیت‌ها
            </Typography>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label="تاریخ"
                value={selectedDate}
                onChange={handleDateChange}
                format="jYYYY/jMM/jDD"
              />
              {user?.role === Role.SECRETARY && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVisit}
                >
                  ویزیت جدید
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={visits || []}
              searchPlaceholder="جستجو در ویزیت‌ها..."
            />
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default VisitsPage;
