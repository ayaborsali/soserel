import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';

import {
  activityLabels,
  activityIcons,
  pagePermissions
} from '../permissions';
import AddZone from './UserActivities/AddZone';
import AddDevice from './UserActivities/AddDevice';
import AddLine from './UserActivities/AddLine';
import AddPost from './UserActivities/AddPost';
import LampList from './UserActivities/LampList';
import DevicesWithMap from './UserActivities/DevicesWithMap';
import ConfigureDashboard from './UserActivities/ConfigureDashboard';
import History from './UserActivities/HistoryList';
import Statistics from './UserActivities/Statistics';
import DataReport from './UserActivities/DataReport';
import ManageUsers from './UserActivities/ManageUsers';
import StatusChanger from './UserActivities/StatusChanger';
import ConfigureThresholds from './UserActivities/ConfigureThresholds';
import QRCodeComponent from './UserActivities/QRCodeComponent';

const componentsMap = {
  qrCodeComponent:QRCodeComponent,
  addZone: AddZone,
  addDevice: AddDevice,
  addLine: AddLine,
  addPost: AddPost,
  lampList: LampList,
  devicesMap: DevicesWithMap,
  configureDashboard: ConfigureDashboard,
  history: History,
  statistics: Statistics,
  dataReport: DataReport,
  manageUsers: ManageUsers,
  configureDevices: StatusChanger,
  configureThresholds: ConfigureThresholds,
};

const UserActivity = ({ activityKey, user, onBack }) => {
  const role = localStorage.getItem('userPoste');
  const allowedActivities = pagePermissions[role] || [];
  const ActivityComponent = componentsMap[activityKey];
  const activityLabel = activityLabels[activityKey];
  const activityIcon = activityIcons[activityKey];

  return (
    <Box p={4} sx={{ maxWidth: 900, mx: 'auto' }}>
      {/* Bouton Retour */}
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{
          mb: 3,
          color: '#2e7d32',
          borderColor: '#2e7d32',
          '&:hover': { backgroundColor: '#e8f5e9', borderColor: '#2e7d32' },
        }}
      >
        Retour
      </Button>

      {/* Vérification des permissions */}
      {allowedActivities.includes(activityKey) ? (
        ActivityComponent ? (
          <Card
            elevation={5}
            sx={{
              borderRadius: 3,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
          >
            <CardContent>
              {/* Header avec icône et titre */}
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    bgcolor: '#2e7d32',
                    mr: 2,
                    width: 50,
                    height: 50,
                  }}
                >
                  {activityIcon}
                </Avatar>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: '#2e7d32' }}
                >
                  {activityLabel}
                </Typography>
              </Box>

              {/* Composant de l'activité */}
              <ActivityComponent user={user} />
            </CardContent>
          </Card>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: 2,
              borderRadius: 3,
              backgroundColor: '#f1f8e9',
              textAlign: 'center',
            }}
          >
            <Avatar sx={{ bgcolor: '#ffc107', mx: 'auto', mb: 2 }}>
              {activityIcon}
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {activityLabel}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ⚠️ Cette fonctionnalité n'est pas encore implémentée.
            </Typography>
          </Paper>
        )
      ) : (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 2,
            borderRadius: 3,
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
          }}
        >
          <Box display="flex" alignItems="center" mb={2}>
            <WarningIcon sx={{ fontSize: 45, color: 'error.main', mr: 2 }} />
            <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
              Accès refusé
            </Typography>
          </Box>
          <Typography variant="body1">
            Vous n’avez pas les permissions pour accéder à :{' '}
            <strong>{activityLabel}</strong>
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default UserActivity;
