import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  TextField,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Device = () => {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les appareils depuis Firestore
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'devices'));
        const deviceList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(deviceList);
      } catch (err) {
        console.error('Erreur lors du chargement des appareils :', err);
      }
    };
    fetchDevices();
  }, []);

  // Filtrer les appareils selon la recherche
  const filteredDevices = devices.filter(device =>
    Object.values(device)
      .some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h5" mb={3}>
        Device List
      </Typography>

      <TextField
        label="Search devices"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {filteredDevices.length === 0 ? (
        <Typography>No devices found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredDevices.map(device => (
            <Grid item xs={12} md={6} key={device.id}>
              <Card variant="outlined">
                <CardContent>
                  {/* Device name and status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {device.name || 'Unnamed Device'}
                    </Typography>
                    <Chip
                      label={device.status || 'Inactive'}
                      color={device.status?.toLowerCase() === 'active' ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {/* General Info */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      General Info:
                    </Typography>
                    {Object.keys(device).map(key => {
                      if (
                        ['id', 'name', 'status', 'localData', 'electricalData', 'transformerData'].includes(key)
                      ) return null;
                      return (
                        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">{key}:</Typography>
                          <Typography variant="body2">{String(device[key])}</Typography>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Local Data */}
                  {device.localData && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Local Data:
                      </Typography>
                      {Object.entries(device.localData).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">{key}:</Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Electrical Data */}
                  {device.electricalData && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Electrical Data:
                      </Typography>
                      {Object.entries(device.electricalData).map(([phase, values]) => (
                        <Box key={phase} sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">{phase}:</Typography>
                          {Object.entries(values).map(([key, val]) => (
                            <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', ml: 2 }}>
                              <Typography variant="body2">{key}:</Typography>
                              <Typography variant="body2">{val.value ?? val}</Typography>
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Transformer Data */}
                  {device.transformerData && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        Transformer Data:
                      </Typography>
                      {Object.entries(device.transformerData).map(([key, value]) => (
                        <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">{key}:</Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default Device;
