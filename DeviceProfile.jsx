import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Box,
  LinearProgress,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';

const DeviceProfile = ({ lampId: propLampId }) => {
  const { lampId: paramLampId } = useParams();
  const lampId = propLampId || paramLampId;

  const [device, setDevice] = useState(null);
  const [usageHours, setUsageHours] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [predictedMaintenance, setPredictedMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lampId) return;

    const fetchDeviceData = async () => {
      try {
        // 1️⃣ Récupérer le device
        const deviceQuery = query(collection(db, 'devices'), where('lampId', '==', lampId));
        const deviceSnapshot = await getDocs(deviceQuery);
        if (deviceSnapshot.empty) {
          setDevice(null);
          setLoading(false);
          return;
        }
        const deviceData = deviceSnapshot.docs[0].data();
        setDevice(deviceData);

        // 2️⃣ Calculer les heures d’usage
        let totalHours = 0;
        const addedAt = deviceData.addedAt?.toDate ? deviceData.addedAt.toDate() : new Date();
        let lastActive = deviceData.status === 'Active' ? new Date() : addedAt;

        const historyQuery = query(
          collection(db, 'history'),
          where('lampId', '==', lampId),
          orderBy('timestamp', 'asc')
        );
        const historySnapshot = await getDocs(historyQuery);
        historySnapshot.forEach(doc => {
          const h = doc.data();
          if (h.newStatus === 'Active') lastActive = h.timestamp?.toDate();
          else if (h.newStatus === 'Inactive' && lastActive) {
            totalHours += (h.timestamp.toDate() - lastActive) / (1000 * 60 * 60);
            lastActive = null;
          }
        });

        // Ajouter le temps depuis le dernier état actif si la lampe est encore active
        if (lastActive) {
          totalHours += (new Date() - lastActive) / (1000 * 60 * 60);
        }
        setUsageHours(totalHours.toFixed(1));

        // 3️⃣ Compter les alertes pour ce poste
        const alertsQuery = query(
          collection(db, 'alerts'),
          where('postId', '==', deviceData.postId)
        );
        const alertsSnapshot = await getDocs(alertsQuery);
        setAlertsCount(alertsSnapshot.size);

        // 4️⃣ Prédiction de maintenance simple
        if (totalHours > 500 || alertsSnapshot.size > 10) {
          setPredictedMaintenance(dayjs().add(14, 'day').format('DD/MM/YYYY'));
        } else {
          setPredictedMaintenance(dayjs().add(30, 'day').format('DD/MM/YYYY'));
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement du device:', error);
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [lampId]);

  if (!lampId) return <Alert severity="error">Lamp ID is not provided.</Alert>;
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  if (!device) return <Alert severity="warning">Device not found.</Alert>;

  return (
    <Paper sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Device Profile - {device.lampId}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Location: {device.location?.lat}, {device.location?.lng}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Line: {device.lineId} | Status: {device.status}
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="subtitle2">Usage Hours</Typography>
            <Typography variant="h6">{usageHours} h</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((usageHours / 1000) * 100, 100)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="subtitle2">Total Alerts</Typography>
            <Typography variant="h6">{alertsCount}</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((alertsCount / 50) * 100, 100)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2">Predicted Maintenance</Typography>
            <TextField
              value={predictedMaintenance}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DeviceProfile;
