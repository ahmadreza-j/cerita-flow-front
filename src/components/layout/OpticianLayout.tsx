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
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import useAuth from "../../hooks/useAuth";
import Link from "next/link";

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
          پنل عینک‌ساز
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
                  "پنل عینک‌ساز"}
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

export default OpticianLayout;
