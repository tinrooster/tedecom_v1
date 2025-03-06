import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ViewModule as RacksIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

// Mock auth hook until the real one is available
const useAuth = () => {
  return {
    user: { username: 'demo', role: 'admin' },
    logout: () => console.log('Logout')
  };
};

const drawerWidth = 240;

interface LayoutProps {
  children?: React.ReactNode;
  title?: string;
}

/**
 * Layout component provides the main structure for the application
 * with a responsive drawer, app bar, and navigation menu
 */
const Layout: React.FC<LayoutProps> = ({ children, title = 'Tedecom' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleHelpMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleHelpMenuClose = () => {
    setHelpAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Equipment', icon: <InventoryIcon />, path: '/equipment' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', role: 'admin' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', role: 'admin' },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    
    const menuItem = menuItems.find(item => item.path === path);
    if (menuItem) return menuItem.text;
    
    if (path.startsWith('/workflows/')) return 'Workflow Details';
    if (path.startsWith('/equipment/')) return 'Equipment Details';
    
    return title;
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Typography variant="h6" noWrap component="div">
          Tedecom
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          // Only show menu items that don't require a specific role or if user has that role
          (!item.role || (user?.role === item.role)) && (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    }
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: location.pathname === item.path 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.primary
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.text === 'Reports' && (
                  <Chip 
                    label="3" 
                    size="small" 
                    color="secondary" 
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          {user && (
            <>
              <Tooltip title="Help">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleHelpMenuOpen}
                >
                  <HelpIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={helpAnchorEl}
                open={Boolean(helpAnchorEl)}
                onClose={handleHelpMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleHelpMenuClose}>Documentation</MenuItem>
                <MenuItem onClick={handleHelpMenuClose}>FAQ</MenuItem>
                <MenuItem onClick={handleHelpMenuClose}>Contact Support</MenuItem>
              </Menu>

              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleNotificationsMenuOpen}
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleNotificationsMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleNotificationsMenuClose}>
                  <Typography variant="body2" color="text.secondary">
                    Equipment #A1234 ready for decommission
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleNotificationsMenuClose}>
                  <Typography variant="body2" color="text.secondary">
                    New report generated: Inventory Status
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleNotificationsMenuClose}>
                  <Typography variant="body2" color="text.secondary">
                    Workflow #WF-2023-001 completed
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleNotificationsMenuClose}>
                  <Typography variant="body2" color="primary">
                    View all notifications
                  </Typography>
                </MenuItem>
              </Menu>

              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                    {user.username.charAt(0).toUpperCase()}
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
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation drawer"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px' 
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default Layout; 