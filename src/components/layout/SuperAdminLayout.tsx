import React from "react";
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
  Grid,
  Avatar,
  Badge,
  Tooltip,
  Paper,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";
import PersianDateTime from "../common/PersianDateTime";

const drawerWidth = 240;

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: "داشبورد", icon: <DashboardIcon />, path: "/super-admin/dashboard" },
  {
    text: "مدیریت مطب‌ها",
    icon: <BusinessIcon />,
    path: "/super-admin/clinics",
  },
  {
    text: "مدیریت کاربران",
    icon: <SupervisorAccountIcon />,
    path: "/super-admin/users",
  },
  { text: "تنظیمات", icon: <SettingsIcon />, path: "/super-admin/settings" },
];

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { logout, user } = useAuth();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/super-admin/login");
  };

  const drawer = (
    <div>
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          color: "white",
        }}
      >
        <Avatar
          sx={{
            width: 70,
            height: 70,
            mb: 1,
            bgcolor: "white",
            color: "primary.main",
            boxShadow: 2,
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          fontWeight="bold"
          align="center"
        >
          پنل مدیر ارشد
        </Typography>
        {user && (
          <Typography variant="body2" sx={{ mt: 1 }} align="center">
            {user.firstName} {user.lastName}
          </Typography>
        )}
      </Box>
      <Divider />
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => router.push(item.path)}
            selected={router.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                "&:hover": {
                  backgroundColor: "primary.light",
                },
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
                "& .MuiListItemText-primary": {
                  fontWeight: "bold",
                  color: "primary.main",
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List sx={{ px: 1 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
            },
            "& .MuiListItemIcon-root": {
              color: "error.main",
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
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
          left: { sm: drawerWidth },
          mr: { sm: `${drawerWidth}px` },
          boxShadow: 2,
          backgroundColor: "white",
          color: "text.primary",
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
              <Typography variant="h6" noWrap component="div" fontWeight="bold">
                {menuItems.find((item) => item.path === router.pathname)
                  ?.text || "پنل مدیر ارشد"}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ color: "text.secondary" }}>
                  <PersianDateTime showFullDate={true} />
                </Box>
                <Tooltip title="اعلان‌ها">
                  <IconButton color="primary">
                    <Badge badgeContent={0} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="پروفایل">
                  <IconButton>
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                    >
                      {user?.firstName?.charAt(0) || "A"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
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
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
              borderRight: "none",
              boxShadow: 3,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
