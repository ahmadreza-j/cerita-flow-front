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
  Grid
} from "@mui/material";
import {
  Menu as MenuIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PersianDateTime from '../common/PersianDateTime';

const drawerWidth = 240;

interface OpticianLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: "داشبورد", icon: <DashboardIcon />, path: "/optician" },
  {
    text: "بیماران نیازمند عینک",
    icon: <VisibilityIcon />,
    path: "/optician/glasses-needed",
  },
  { text: "ثبت فروش", icon: <SalesIcon />, path: "/optician/sales" },
  { text: "محصولات", icon: <InventoryIcon />, path: "/optician/products" },
];

const OpticianLayout: React.FC<OpticianLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          پنل عینک‌ساز
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={logout}>
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
                {menuItems.find((item) => item.path === location.pathname)?.text ||
                  "پنل عینک‌ساز"}
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ color: 'white' }}>
                <PersianDateTime showFullDate={true} />
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

export default OpticianLayout;
