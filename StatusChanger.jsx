import React, { useState, useEffect } from 'react';
import {
  Typography,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';

const StatusChanger = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'devices'));
        const devicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevices(devicesList);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice && selectedDevice.status) {
      setNewStatus(selectedDevice.status);
    }
  }, [selectedDevice]);

  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    setNewStatus(updatedStatus);

    if (!selectedDevice?.id) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const deviceRef = doc(db, 'devices', selectedDevice.id);
      await updateDoc(deviceRef, { status: updatedStatus });

      await addDoc(collection(db, 'history'), {
        message: `Status changed: ${selectedDevice.name || selectedDevice.lampId} → ${updatedStatus}`,
        timestamp: serverTimestamp(),
        userEmail: user.email,
        deviceId: selectedDevice.id,
        previousStatus: selectedDevice.status,
        newStatus: updatedStatus,
        deviceType: selectedDevice.deviceType || 'Unknown',
        location: selectedDevice.location || 'Unknown',
      });

      setDevices(prev =>
        prev.map(dev =>
          dev.id === selectedDevice.id ? { ...dev, status: updatedStatus } : dev
        )
      );
      setSelectedDevice(prev => ({ ...prev, status: updatedStatus }));
    } catch (error) {
      console.error('Firestore error:', error);
    }
  };

  const formatLocation = (loc) => {
    if (!loc) return 'Unknown';
    if (loc.lat !== undefined && loc.lng !== undefined)
      return `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`;
    return 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Inactive': return 'gray';
      case 'Faulty': return 'red';
      case 'Maintenance': return 'purple';

      default: return 'black';
    }
  };

  const getLampStateLabel = (state) => {
    switch (state) {
      case "0": return "Off";
      case "1": return "On";
      default: return state;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Devices List */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>📋 Devices List</Typography>
          <Card sx={{ maxHeight: 500, overflowY: 'auto' }}>
            <CardContent>
              {devices.map((device) => (
                <Button
                  key={device.id}
                  variant={selectedDevice?.id === device.id ? 'contained' : 'outlined'}
                  color="primary"
                  fullWidth
                  sx={{ mb: 1, justifyContent: 'flex-start' }}
                  onClick={() => setSelectedDevice(device)}
                >
                  {device.deviceType} - {device.name || device.lampId || device.concentratorId || device.transformerId}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Device Details */}
        <Grid item xs={12} md={8}>
          {selectedDevice ? (
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  📟 {selectedDevice.deviceType} - {selectedDevice.name || selectedDevice.lampId || selectedDevice.concentratorId || selectedDevice.transformerId}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body1">📍 Location:</Typography>
                    <Typography variant="body2">{formatLocation(selectedDevice.location)}</Typography>
                  </Grid>

                  {selectedDevice.deviceType === 'Lamp' && <>
                    <Grid item xs={6}>
                      <Typography variant="body1">💡 Lamp ID:</Typography>
                      <Typography variant="body2">{selectedDevice.lampId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">📊 Line ID:</Typography>
                      <Typography variant="body2">{selectedDevice.lineId}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">🕹 Lamp State:</Typography>
                      <Chip
                        label={getLampStateLabel(selectedDevice.lampState)}
                        color={selectedDevice.lampState === "1" ? "success" : "default"}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">🔆 Light Level:</Typography>
                      <Typography variant="body2">{selectedDevice.lightLevel}%</Typography>
                    </Grid>
                  </>}

                  {selectedDevice.deviceType === 'Concentrateur' && <>
                    <Grid item xs={6}>
                      <Typography variant="body1">Capacity:</Typography>
                      <Typography variant="body2">{selectedDevice.capacity || 'N/A'}</Typography>
                    </Grid>
                  </>}

                  {selectedDevice.deviceType === 'Transformateur' && <>
                    <Grid item xs={6}>
                      <Typography variant="body1">Voltage:</Typography>
                      <Typography variant="body2">{selectedDevice.voltage || 'N/A'} V</Typography>
                    </Grid>
                  </>}

                  <Grid item xs={6}>
                    <Typography variant="body1">Added By:</Typography>
                    <Typography variant="body2">{selectedDevice.addedBy}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">Status:</Typography>
                    <Box display="flex" alignItems="center">
                      <CircleIcon sx={{ color: getStatusColor(selectedDevice.status), fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">{selectedDevice.status}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>🔧 Change Status</Typography>
                <Select
                  value={newStatus}
                  onChange={handleStatusChange}
                  fullWidth
                >
                  <MenuItem value="Active">🟢 Active</MenuItem>
                  <MenuItem value="Inactive">⚪ Inactive</MenuItem>
                  <MenuItem value="Maintenance">🟠 Maintenance</MenuItem>
                  <MenuItem value="Faulty">🔴 Faulty</MenuItem>
                </Select>
              </CardContent>
            </Card>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Select a device from the list to view details.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatusChanger;
