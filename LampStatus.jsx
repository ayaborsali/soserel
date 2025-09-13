import React, { useEffect, useState } from 'react';
import { Typography, Paper, List, ListItem, ListItemText } from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // adapte ce chemin si besoin

const DeviceList = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'devices'));
        const devicesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(devicesData);
      } catch (error) {
        console.error('Erreur lors du chargement des lampes :', error);
      }
    };

    fetchDevices();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Liste des lampes</Typography>
      <List>
        {devices.map((device) => (
          <ListItem key={device.id}>
            <ListItemText
              primary={device.name || 'Nom inconnu'}
              secondary={`Statut : ${device.status || 'Inconnu'}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default DeviceList;
