import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  Grid
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  LocalHospital as ExaminationIcon,
  Receipt as PrescriptionIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Event as EventIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";

const drawerWidth = 240;

interface DoctorLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: "داشبورد", icon: <DashboardIcon />, path: "/doctor" },
  { text: "نوبت‌های امروز", icon: <EventIcon />, path: "/doctor/today-visits" },
  { text: "بیماران", icon: <PersonIcon />, path: "/doctor/patients" },
  { text: "معاینات", icon: <MedicalServicesIcon />, path: "/doctor/examinations" },
];

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          پنل دکتر
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} passHref key={item.text}>
            <ListItemButton
              selected={router.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={() => {
          logout();
          router.push('/login');
        }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="خروج" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mr: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h6" noWrap component="div">
                {menuItems.find((item) => item.path === router.pathname)?.text ||
                  "پنل دکتر"}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ color: 'white' }}>
                {new Date().toLocaleDateString('fa-IR')}
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          anchor={theme.direction === "rtl" ? "right" : "left"}
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default DoctorLayout;
