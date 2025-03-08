import React, { useState, useEffect } from 'react';
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
  Skeleton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import useAuth from '../../hooks/useAuth';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import PageLoader from '../common/PageLoader';

// Import PersianDateTime with no SSR to prevent hydration errors
const PersianDateTime = dynamic(() => import('../common/PersianDateTime'), {
  ssr: false,
});

// عرض منوی کناری
const drawerWidth = 240;

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'داشبورد', icon: <DashboardIcon />, path: '/super-admin/dashboard' },
  { text: 'مدیریت مطب‌ها', icon: <BusinessIcon />, path: '/super-admin/clinics' },
  { text: 'مدیریت کاربران', icon: <SupervisorAccountIcon />, path: '/super-admin/users' },
  { text: 'تنظیمات', icon: <SettingsIcon />, path: '/super-admin/settings' }
];

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { logout, user, isAuthenticated, loading } = useAuth();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const [mounted, setMounted] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Handle initial page load
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Add a router event listener to show loading state during navigation
  useEffect(() => {
    const handleStart = () => setPageLoading(true);
    const handleComplete = () => setPageLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.events]);

  // Check authentication and redirect if necessary
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
        
        // If no token or not a super admin, redirect to login
        if (!token || !isSuperAdmin) {
          console.log('Redirecting to login: No token or not super admin');
          router.push('/super-admin/login');
          return;
        }
        
        // If we have token but not authenticated in the context, let's wait for the auth check
        if (!isAuthenticated && !pageLoading) {
          console.log('No authenticated user in context but token exists, waiting...');
          // Wait a bit more before deciding to redirect
          setTimeout(() => {
            if (!isAuthenticated) {
              console.log('Still not authenticated after waiting, redirecting to login');
              router.push('/super-admin/login');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/super-admin/login');
      }
    };

    checkAuth();
  }, [mounted, isAuthenticated, router, pageLoading]);

  // Show loading state while checking authentication
  if (!mounted || pageLoading) {
    return <PageLoader />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/super-admin/login');
  };

  const drawer = (
    <div>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white'
      }}>
        <Avatar 
          sx={{ 
            width: 70, 
            height: 70, 
            mb: 1,
            bgcolor: 'white',
            color: 'primary.main',
            boxShadow: 2
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography variant="h6" noWrap component="div" fontWeight="bold" align="center">
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
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 'bold',
                  color: 'primary.main',
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
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
            },
            '& .MuiListItemIcon-root': {
              color: 'error.main',
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
    <>
      <Head>
        <style>{`
          .app-container {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          .app-container.loaded {
            opacity: 1;
          }
        `}</style>
      </Head>
      
      <Box 
        sx={{ display: 'flex' }} 
        dir="rtl"
        className={`app-container ${!pageLoading ? 'loaded' : ''}`}
      >
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            boxShadow: 2,
            backgroundColor: 'white',
            color: 'text.primary'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                  {menuItems.find(item => item.path === router.pathname)?.text || 'پنل مدیر ارشد'}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {mounted ? (
                    <Box sx={{ color: 'text.secondary' }}>
                      <PersianDateTime showFullDate={true} />
                    </Box>
                  ) : (
                    <Skeleton width={150} height={24} />
                  )}
                  <Tooltip title="اعلان‌ها">
                    <IconButton color="primary">
                      <Badge badgeContent={0} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="پروفایل">
                    <IconButton>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user?.firstName?.charAt(0) || 'A'}
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
          {/* Drawer برای حالت موبایل */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth
              }
            }}
          >
            {drawer}
          </Drawer>
          {/* Drawer برای حالت دسکتاپ */}
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderLeft: theme.direction === 'rtl' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                borderRight: theme.direction === 'rtl' ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: 3
              }
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
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </>
  );
};

export default SuperAdminLayout;
