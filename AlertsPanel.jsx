import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ErrorIcon from '@mui/icons-material/Error';

const AlertCard = ({ icon, label, count, bgColor, color }) => (
  <Paper
    sx={{
      p: 3,
      bgcolor: bgColor,
      color: color,
      borderRadius: 2,
      boxShadow: 3,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      cursor: 'default',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.05)',
      },
      userSelect: 'none',
    }}
    elevation={4}
  >
    {icon}
    <Typography variant="h6" component="div" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="h3" component="div" fontWeight="bold">
      {count}
    </Typography>
  </Paper>
);

const AlertsPanel = ({ alerts = 14, status = 14, critical = 14 }) => {
  const theme = useTheme();

  return (
    <Box mt={2}>
      <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
        System Overview
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        <AlertCard
          icon={<WarningAmberIcon sx={{ fontSize: 40 }} />}
          label="Alert"
          count={alerts}
          bgColor={theme.palette.warning.light}
          color={theme.palette.warning.contrastText}
        />
        <AlertCard
          icon={<LightbulbIcon sx={{ fontSize: 40 }} />}
          label="Status"
          count={status}
          bgColor={theme.palette.grey[100]}
          color={theme.palette.text.primary}
        />
        <AlertCard
          icon={<ErrorIcon sx={{ fontSize: 40 }} />}
          label="Critical"
          count={critical}
          bgColor={theme.palette.error.main}
          color={theme.palette.error.contrastText}
        />
      </Box>
    </Box>
  );
};

export default AlertsPanel;
