import React from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Group as GroupIcon,
  LocalHospital as DoctorIcon,
  Person as SecretaryIcon,
  Visibility as OptometristIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import axios from "axios";

interface StatsCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const Dashboard = () => {
  const { data: stats } = useQuery("adminStats", async () => {
    const res = await axios.get("/api/admin/stats");
    return res.data;
  });

  const { data: recentUsers } = useQuery("recentUsers", async () => {
    const res = await axios.get("/api/admin/users/recent");
    return res.data;
  });

  const { data: recentVisits } = useQuery("recentVisits", async () => {
    const res = await axios.get("/api/admin/visits/recent");
    return res.data;
  });

  const statsCards: (StatsCard & { id: string })[] = [
    {
      id: "total-users",
      title: "کل کاربران",
      value: stats?.totalUsers || 0,
      icon: <GroupIcon />,
      color: "#2196f3",
    },
    {
      id: "doctors",
      title: "پزشکان",
      value: stats?.doctorsCount || 0,
      icon: <DoctorIcon />,
      color: "#4caf50",
    },
    {
      id: "secretaries",
      title: "منشی‌ها",
      value: stats?.secretariesCount || 0,
      icon: <SecretaryIcon />,
      color: "#ff9800",
    },
    {
      id: "opticians",
      title: "عینک‌سازها",
      value: stats?.opticiansCount || 0,
      icon: <OptometristIcon />,
      color: "#9c27b0",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statsCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 140,
                bgcolor: card.color,
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {card.icon}
                <Typography component="h2" variant="h4">
                  {card.value}
                </Typography>
              </Box>
              <Typography component="p" variant="h6" sx={{ mt: 2 }}>
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="کاربران جدید"
              subheader="کاربران اضافه شده در 7 روز گذشته"
            />
            <Divider />
            <CardContent>
              <List>
                {recentUsers?.map((user: any) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemText
                        primary={user.fullName}
                        secondary={`${user.role} - ${new Date(
                          user.createdAt
                        ).toLocaleDateString("fa-IR")}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Visits */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="ویزیت‌های اخیر"
              subheader="ویزیت‌های انجام شده در 7 روز گذشته"
            />
            <Divider />
            <CardContent>
              <List>
                {recentVisits?.map((visit: any) => (
                  <React.Fragment key={visit.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${visit.patientName} - ${visit.doctorName}`}
                        secondary={new Date(visit.visitDate).toLocaleDateString(
                          "fa-IR"
                        )}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
