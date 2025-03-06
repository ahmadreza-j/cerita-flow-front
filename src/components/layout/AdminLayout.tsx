import React, { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuth from '../../hooks/useAuth';

const drawerWidth = 260;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled('input')(({ theme }) => ({
  color: 'inherit',
  border: 'none',
  background: 'transparent',
  '&:focus': {
    outline: 'none',
  },
  padding: theme.spacing(1, 1, 1, 0),
  // vertical padding + font size from searchIcon
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  transition: theme.transitions.create('width'),
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '20ch',
  },
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
}));

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { text: 'داشبورد', icon: <DashboardIcon />, href: '/admin' },
    { text: 'مدیریت کاربران', icon: <PeopleIcon />, href: '/admin/users' },
    { text: 'تنظیمات', icon: <SettingsIcon />, href: '/admin/settings' },
  ];

  return (
    <Box sx={{ display: 'flex', direction: 'rtl' }}>
      <StyledAppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }} 
            component="div"
          >
            سیستم مدیریت کلینیک
          </Typography>
          
          <Search>
            <SearchIconWrapper>
              <SearchIcon color="action" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="جستجو..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="اعلان‌ها">
              <IconButton
                size="large"
                aria-label="show new notifications"
                aria-controls="menu-notifications"
                aria-haspopup="true"
                onClick={handleNotificationsMenu}
                color="inherit"
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-notifications"
              anchorEl={notificationsAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
            >
              <MenuItem onClick={handleNotificationsClose}>اعلان 1</MenuItem>
              <MenuItem onClick={handleNotificationsClose}>اعلان 2</MenuItem>
              <MenuItem onClick={handleNotificationsClose}>اعلان 3</MenuItem>
              <Divider />
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="body2" color="primary" align="center" sx={{ width: '100%' }}>
                  مشاهده همه اعلان‌ها
                </Typography>
              </MenuItem>
            </Menu>
            
            <Tooltip title="پروفایل">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>پروفایل</MenuItem>
              <MenuItem onClick={handleClose}>تنظیمات حساب</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>خروج</MenuItem>
            </Menu>
          </Box>
          
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ 
              ...(open && { display: 'none' }),
              ml: 1,
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderLeft: 'none',
            boxShadow: '0 10px 30px 0 rgba(0,0,0,0.1)',
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 3,
            pb: 3,
            borderBottom: `1px dashed ${theme.palette.divider}`,
          }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">{user?.username || 'مدیر'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email || 'admin@example.com'}</Typography>
          </Box>
          
          <List>
            {menuItems.map((item) => (
              <Link href={item.href} passHref key={item.text}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton 
                    selected={router.pathname === item.href}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        },
                        '& .MuiListItemIcon-root': {
                          color: theme.palette.primary.main,
                        },
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
          
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ px: 3, mb: 1, fontWeight: 'medium' }}
            >
              دسترسی سریع
            </Typography>
          </Box>
          
          <List>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="خروج از سیستم" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 2, 
          mt: 'auto',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}>
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Drawer>
      
      <Main open={open}>
        <Toolbar />
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default AdminLayout;
