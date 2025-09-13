import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Avatar, Tabs, Tab } from '@mui/material';
import UserActivity from './UserActivity';
import { activityLabels } from '../permissions';
import {
  AddCircleOutline,
  DeviceHub,
  PostAdd,
  ListAlt,
  Map,
  Info,
  Dashboard,
  History,
  BarChart,
  InsertChart,
  Group,
  Settings,
  Tune,
} from '@mui/icons-material';
import QRCodeComponent from './UserActivities/QRCodeComponent';

const iconMap = {
  addDevice: <AddCircleOutline />,
  addLine: <DeviceHub />,
  addPost: <PostAdd />,
  lampList: <ListAlt />,
  devicesMap: <Map />,
  lampStatus: <Info />,
  configureDashboard: <Dashboard />,
  history: <History />,
  statistics: <BarChart />,
  dataReport: <InsertChart />,
  manageUsers: <Group />,
  configureDevices: <Settings />,
  configureThresholds: <Tune />,
};

// Activity groups
const groupedActivities = {
  "Equipment Management": ["addDevice","qrCodeComponent","addZone","addLine", "addPost", "configureDevices", "configureThresholds"],
  "Visualization & Monitoring": ["lampList", "devicesMap", "statistics", "dataReport", "history"],
  "Administration": ["configureDashboard", "manageUsers"],
};

const RolesPermissions = ({ user }) => {
  const [selectedActivityKey, setSelectedActivityKey] = useState(null);
  const [role, setRole] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const storedRole = localStorage.getItem('userPoste');
    setRole(storedRole);
  }, []);

  const groupKeys = Object.keys(groupedActivities);

  return (
    <Box p={4} sx={{ maxWidth: 1000, mx: 'auto' }}>
      {!selectedActivityKey ? (
        <>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#2e7d32', mb: 3 }}>
            Allowed Activities for Role: <strong>{role || 'Loading...'}</strong>
          </Typography>

          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            {groupKeys.map((group, index) => (
              <Tab key={index} label={group} />
            ))}
          </Tabs>

          {/* Content of selected tab */}
          <Grid container spacing={3}>
            {groupedActivities[groupKeys[tabValue]].map((key) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Paper
                  elevation={5}
                  sx={{
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' },
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={
                      <Avatar sx={{ bgcolor: '#2e7d32', width: 36, height: 36, color: 'white' }}>
                        {iconMap[key] || <Settings />}
                      </Avatar>
                    }
                    onClick={() => setSelectedActivityKey(key)}
                    sx={{
                      mt: 1,
                      py: 1.5,
                      fontWeight: 600,
                      backgroundColor: '#43a047',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2e7d32' },
                      textTransform: 'none',
                    }}
                  >
                    {activityLabels[key]}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <UserActivity activityKey={selectedActivityKey} user={user} onBack={() => setSelectedActivityKey(null)} />
      )}
    </Box>
  );
};

export default RolesPermissions;
