import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  CircularProgress,
  Divider,
  Avatar,
  Container,
  Skeleton
} from "@mui/material";
import {
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import api from "../../src/utils/api";
import SuperAdminLayout from "../../src/components/layout/SuperAdminLayout";
import { Clinic } from "../../src/types/auth";
import useAuth from "../../src/hooks/useAuth";

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Check if user is authenticated and user data is loaded
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserLoaded(true);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get("/api/super-admin/clinics");
        setClinics(response.data.clinics || []);
      } catch (err) {
        console.error("Failed to fetch clinics:", err);
        setError("خطا در دریافت اطلاعات کلینیک‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) {
    return (
      <SuperAdminLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 2,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            color: "white",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            داشبورد مدیر ارشد
          </Typography>
          {userLoaded ? (
            <Typography variant="subtitle1">
              خوش آمدید، {user?.firstName} {user?.lastName}
            </Typography>
          ) : (
            <Skeleton width={200} height={24} sx={{ bgcolor: "rgba(255, 255, 255, 0.3)" }} />
          )}
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2" fontWeight="bold">
                  کلینیک‌ها
                </Typography>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
              <Typography
                variant="h3"
                component="p"
                sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}
              >
                {clinics.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                تعداد کل کلینیک‌های ثبت شده در سیستم
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  mt: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/super-admin/clinics/new")}
                  sx={{ borderRadius: 2 }}
                >
                  افزودن کلینیک جدید
                </Button>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/super-admin/clinics")}
                >
                  مشاهده همه
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 2,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2" fontWeight="bold">
                  مدیران سیستم
                </Typography>
                <Avatar sx={{ bgcolor: "secondary.main" }}>
                  <SupervisorAccountIcon />
                </Avatar>
              </Box>
              <Typography
                variant="h3"
                component="p"
                sx={{ mb: 2, fontWeight: "bold", color: "secondary.main" }}
              >
                {/* Placeholder for admin count */}
                {0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                تعداد کل مدیران سیستم
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  mt: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push("/super-admin/users/new")}
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                >
                  افزودن مدیر جدید
                </Button>
                <Button
                  variant="text"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push("/super-admin/users")}
                  color="secondary"
                >
                  مشاهده همه
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Clinics */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            fontWeight="bold"
          >
            آخرین کلینیک‌های ثبت شده
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {clinics.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
              هیچ کلینیکی ثبت نشده است.
            </Typography>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {clinics.slice(0, 3).map((clinic) => (
                <Grid item xs={12} md={4} key={clinic.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      transition: "transform 0.3s, box-shadow 0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          <BusinessIcon />
                        </Avatar>
                      }
                      title={clinic.name}
                      titleTypographyProps={{
                        fontWeight: "bold",
                        align: "right",
                      }}
                      subheader={`تاریخ ثبت: ${new Date(
                        clinic.createdAt
                      ).toLocaleDateString("fa-IR")}`}
                      subheaderTypographyProps={{ align: "right" }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {clinic.address || "بدون آدرس"}
                      </Typography>
                      {clinic.phone && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          شماره تماس: {clinic.phone}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            router.push(`/super-admin/clinics/${clinic.id}`)
                          }
                          endIcon={<ArrowForwardIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          مشاهده جزئیات
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Container>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
