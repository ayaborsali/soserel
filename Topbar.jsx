import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Divider,
  Badge,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Logout,
  Settings,
  AccountCircle,
  NotificationsNone,
  ExpandMore
} from '@mui/icons-material';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const primaryGreen = '#1b5e20';
  const darkGreen = '#0d4712';
  const lightGreen = '#4caf50';

  // Update time and date
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch unread alerts count from Firestore
  useEffect(() => {
    const q = query(collection(db, 'alerts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().read).length;
      setUnreadAlerts(unread);
    });
    return () => unsubscribe();
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${primaryGreen} 0%, ${darkGreen} 100%)`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderBottom: `1px solid ${lightGreen}30`,
      }}
    >
      <Toolbar sx={{ minHeight: '70px !important' }}>
        {/* Logo/Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 2,
              boxShadow: '0 0 15px rgba(76, 175, 80, 0.4)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11 19V13H13V19H11ZM5 13V11H7V13H5ZM17 13V11H19V13H17ZM5 7V5H7V7H5ZM17 7V5H19V7H17ZM11 11V5H13V11H11Z" fill="white" />
            </svg>
          </Box>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: '700',
              background: 'linear-gradient(45deg, #ffffff, #e8f5e9)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Energy Dashboard
          </Typography>
        </Box>

        {/* Date and time display */}
        <Box
          sx={{
            marginLeft: 4,
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: '600', letterSpacing: 0.5, color: '#e8f5e9', opacity: 0.9 }}>
            {currentDate}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: '700', letterSpacing: 1, color: 'white', textShadow: '0 0 10px rgba(76, 175, 80, 0.7)' }}>
            {currentTime}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          sx={{
            color: 'white',
            marginRight: 1,
            background: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
          }}
        >
          <Badge badgeContent={unreadAlerts} color="error">
            <NotificationsNone />
          </Badge>
        </IconButton>

        {user && (
          <>
            <Chip label="Online" size="small" sx={{ background: lightGreen, color: 'white', fontWeight: '600', marginRight: 2, boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)' }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
              }}
              onClick={handleMenuOpen}
            >
              <Avatar sx={{ bgcolor: lightGreen, width: 36, height: 36, marginRight: 1 }}>{user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>
                  {user.displayName || user.email.split('@')[0]}
                </Typography>
              </Box>
              <ExpandMore sx={{ color: 'white', marginLeft: 1 }} />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', marginTop: 1, borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', minWidth: 200, '& .MuiMenuItem-root': { padding: '12px 16px', '&:hover': { background: `${lightGreen}15` } } } }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: '600', color: primaryGreen }}>
                  {user.displayName || user.email}
                </Typography>
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem>
                <AccountCircle sx={{ marginRight: 2, color: primaryGreen }} />
                Profile
              </MenuItem>
              <MenuItem>
                <Settings sx={{ marginRight: 2, color: primaryGreen }} />
                Settings
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ marginRight: 2, color: primaryGreen }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
