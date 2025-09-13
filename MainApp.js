import React, { useState } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Device from './components/Device';
import AlertsNotifications from './components/AlertsNotifications';
import RolesPermissions from './components/RolesPermissions';
import ProjectConfiguration from './components/ProjectConfiguration';
import AlertProject from './components/AlertProject';
import NeuralNetworkTrainer from './components/NeuralNetworkTrainer';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import UserActivity from './components/UserActivity';  // nouveau composant

const pages = [
  { label: 'Dashboard', component: <Dashboard /> },
  { label: 'Device', component: <Device /> },
  { label: 'Alerts-Notifications', component: <AlertsNotifications /> },
  { label: 'Users', component: null }, // on gère via état
  { label: 'Roles & Permissions', component: null }, // idem
  { label: 'User Activity', component: null },        // idem
  { label: 'Project Configuration', component: <ProjectConfiguration /> },
  { label: 'Alert Project', component: <AlertProject /> },
  { label: 'Prediction', component: <NeuralNetworkTrainer /> },
];

function MainApp() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({ role: '', name: '' });
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleUserLogin = (role, name) => {
    setUserInfo({ role, name });
    setSelectedIndex(4); // afficher RolesPermissions
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setSelectedIndex(5); // afficher User Activity
  };

  return (
    <Box display="flex" height="100vh">
      <Sidebar selectedIndex={selectedIndex} onMenuSelect={setSelectedIndex} />
      <Box flex={1} display="flex" flexDirection="column">
        <Topbar />
        <Box p={3} flex={1} overflow="auto" bgcolor="#f5f5f5">
          {selectedIndex === 3 && <Users onLogin={handleUserLogin} />}
          {selectedIndex === 4 && (
            <RolesPermissions
              role={userInfo.role}
              name={userInfo.name}
              onSelectActivity={handleSelectActivity}  // passage du callback
            />
          )}
          {selectedIndex === 5 && (
            <UserActivity
              activity={selectedActivity}
              user={userInfo}
              onBack={() => setSelectedIndex(4)} // bouton retour vers RolesPermissions
            />
          )}
          {selectedIndex !== 3 && selectedIndex !== 4 && selectedIndex !== 5 &&
            pages[selectedIndex].component}
        </Box>
      </Box>
    </Box>
   
    
  );
}

export default MainApp;
