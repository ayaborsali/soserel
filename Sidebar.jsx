import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Avatar,
  Tooltip,
  Collapse,
} from '@mui/material';
import { motion } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import WarningIcon from '@mui/icons-material/Warning';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const drawerWidth = 280;
const collapsedWidth = 72;

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon /> },
  { label: 'Device', icon: <DevicesIcon /> },
  { label: 'Alerts - Notifications', icon: <NotificationsIcon /> },
  { label: 'Users', icon: <PersonIcon /> },
  { label: 'Roles & Permissions', icon: <SecurityIcon /> },
  { label: 'User Activity', icon: <HistoryIcon /> },
  { label: 'Project Configuration', icon: <TuneIcon /> },
  { label: 'Alert Project', icon: <WarningIcon /> },
  { label: 'Prediction ', icon: <DeviceHubIcon /> },
];

const Sidebar = ({ selectedIndex, onMenuSelect }) => {
  const [hovered, setHovered] = useState(false);
  const mainGreen = '#1b5e20';
  const lightGreen = '#e8f5e9';
  const mediumGreen = '#4caf50';
  const glowGreen = '#00ff00';

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        width: hovered ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: hovered ? drawerWidth : collapsedWidth,
          background: lightGreen,
          color: '#000',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          overflowX: 'hidden',
          transition: 'width 0.3s ease',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 2, textAlign: 'center', transition: 'all 0.3s' }}>
        <Avatar
          sx={{
            mx: 'auto',
            bgcolor: mainGreen,
            width: 56,
            height: 56,
            boxShadow: `0 0 20px ${mainGreen}70`,
            transition: 'all 0.4s ease',
          }}
        >
          <DevicesIcon fontSize="large" />
        </Avatar>
        <Collapse in={hovered}>
          <Typography
            variant="h6"
            mt={1}
            fontWeight="bold"
            sx={{
              color: mainGreen,
              textShadow: `0 0 6px ${mainGreen}80`,
              transition: 'all 0.3s ease',
            }}
          >
            ENERGY
          </Typography>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.1)', mb: 1 }} />

      {/* Menu Items */}
      <List>
        {menuItems.map((item, index) => (
          <Tooltip
            key={item.label}
            title={item.label}
            placement="right"
            arrow
            disableHoverListener={hovered}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05, x: 5, boxShadow: `0 0 12px ${mainGreen}60` }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.05 }}
            >
              <ListItem
                button
                selected={selectedIndex === index}
                onClick={() => onMenuSelect(index)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: `linear-gradient(45deg, ${mainGreen}, #2e7d32)`,
                    color: '#fff',
                    boxShadow: `0 0 15px ${mainGreen}80`,
                    '& .MuiListItemIcon-root': {
                      color: '#fff',
                      transform: 'scale(1.2)',
                      transition: 'transform 0.3s',
                      filter: `drop-shadow(0 0 3px ${glowGreen})`,
                    },
                    '& .MuiListItemText-root': {
                      textShadow: `0 0 6px ${mainGreen}80`,
                    },
                  },
                  '&:hover': {
                    background: `${mediumGreen}20`,
                    boxShadow: `0 0 10px ${mediumGreen}40`,
                    '& .MuiListItemIcon-root': {
                      filter: `drop-shadow(0 0 2px ${mainGreen})`,
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: mainGreen, 
                    minWidth: 36,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Collapse in={hovered}>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: 'inherit',
                    }}
                  />
                </Collapse>
              </ListItem>
            </motion.div>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;