import React from 'react';
import { Typography, Paper, Switch, FormControlLabel, Box } from '@mui/material';
import { useSectionVisibility } from './SectionVisibilityContext';

const ConfigureDashboard = () => {
  const { showStats, setShowStats, showAlerts, setShowAlerts } = useSectionVisibility();

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        boxShadow: 6,
        backgroundColor: '#e8f5e9', // light green background
        maxWidth: 400,
        mx: 'auto',
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: '#2e7d32', mb: 3, textAlign: 'center' }}
      >
        Configure Dashboard
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showStats}
              onChange={() => setShowStats(!showStats)}
              sx={{
                '& .MuiSwitch-thumb': { backgroundColor: '#2e7d32' },
                '& .Mui-checked': { color: '#1b5e20' },
                '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#81c784' },
              }}
            />
          }
          label="Show Statistics"
          sx={{ color: '#1b5e20', fontWeight: 600 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={showAlerts}
              onChange={() => setShowAlerts(!showAlerts)}
              sx={{
                '& .MuiSwitch-thumb': { backgroundColor: '#2e7d32' },
                '& .Mui-checked': { color: '#1b5e20' },
                '& .Mui-checked + .MuiSwitch-track': { backgroundColor: '#81c784' },
              }}
            />
          }
          label="Show Alerts"
          sx={{ color: '#1b5e20', fontWeight: 600 }}
        />
      </Box>
    </Paper>
  );
};

export default ConfigureDashboard;
