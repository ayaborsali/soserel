import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Fade,
  Slide,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Thermostat as ThermostatIcon,
  Opacity as HumidityIcon,
  FlashOn as PowerIcon,
  Speed as VoltageIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { collection, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const ConfigureThresholds = () => {
  const [thresholds, setThresholds] = useState({
    temperature: { min: 10, max: 30, enabled: true },
    humidity: { min: 30, max: 70, enabled: true },
    lightLevel: { min: 20, max: 80, enabled: true },
    powerConsumption: { min: 0, max: 100, enabled: true },
    voltage: { min: 200, max: 240, enabled: true }
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', severity: 'success' });

  useEffect(() => {
    // Load thresholds from Firebase
    const loadThresholds = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'thresholds'));
        if (!querySnapshot.empty) {
          const thresholdsData = querySnapshot.docs[0].data();
          setThresholds(prev => ({ ...prev, ...thresholdsData }));
        }
      } catch (error) {
        console.error('Error loading thresholds:', error);
        showAlert('Error loading thresholds', 'error');
      }
    };

    loadThresholds();

    // Listen for real-time changes
    const unsubscribe = onSnapshot(doc(db, 'thresholds', 'default'), (doc) => {
      if (doc.exists()) {
        setThresholds(prev => ({ ...prev, ...doc.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  const showAlert = (message, severity = 'success') => {
    setSaveStatus({ show: true, message, severity });
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleThresholdChange = (parameter, field, value) => {
    setThresholds(prev => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        [field]: value
      }
    }));
  };

  const handleToggleChange = (parameter, enabled) => {
    setThresholds(prev => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        enabled
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'thresholds', 'default'), thresholds);
      showAlert('Thresholds saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving thresholds:', error);
      showAlert('Error saving thresholds', 'error');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setThresholds({
      temperature: { min: 10, max: 30, enabled: true },
      humidity: { min: 30, max: 70, enabled: true },
      lightLevel: { min: 20, max: 80, enabled: true },
      powerConsumption: { min: 0, max: 100, enabled: true },
      voltage: { min: 200, max: 240, enabled: true }
    });
    showAlert('Thresholds reset to default values', 'info');
  };

  const ThresholdCard = ({ title, parameter, unit, minRange, maxRange, icon, index }) => (
    <Slide in={true} direction="up" timeout={(index + 1) * 200}>
      <Card sx={{ 
        height: '100%', 
        borderRadius: 2,
        border: thresholds[parameter].enabled ? '2px solid #4CAF50' : '2px solid #e0e0e0',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ 
              color: thresholds[parameter].enabled ? 'success.main' : 'text.secondary',
              mr: 1 
            }}>
              {icon}
            </Box>
            <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={thresholds[parameter].enabled}
                onChange={(e) => handleToggleChange(parameter, e.target.checked)}
                color="success"
              />
            }
            label={`Monitoring ${thresholds[parameter].enabled ? 'enabled' : 'disabled'}`}
            sx={{ mb: 2 }}
          />

          {thresholds[parameter].enabled && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>Acceptable Range</Typography>
                <Slider
                  value={[thresholds[parameter].min, thresholds[parameter].max]}
                  onChange={(_, newValue) => {
                    handleThresholdChange(parameter, 'min', newValue[0]);
                    handleThresholdChange(parameter, 'max', newValue[1]);
                  }}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}${unit}`}
                  min={minRange}
                  max={maxRange}
                  sx={{ 
                    mb: 2,
                    color: '#4CAF50',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#4CAF50'
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#4CAF50'
                    }
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Minimum"
                    type="number"
                    value={thresholds[parameter].min}
                    onChange={(e) => handleThresholdChange(parameter, 'min', Number(e.target.value))}
                    inputProps={{ min: minRange, max: thresholds[parameter].max }}
                    size="small"
                    color="success"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Maximum"
                    type="number"
                    value={thresholds[parameter].max}
                    onChange={(e) => handleThresholdChange(parameter, 'max', Number(e.target.value))}
                    inputProps={{ min: thresholds[parameter].min, max: maxRange }}
                    size="small"
                    color="success"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Chip
                  icon={<WarningIcon />}
                  label={`Threshold: ${thresholds[parameter].min}${unit} - ${thresholds[parameter].max}${unit}`}
                  color="success"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#4CAF50',
                    color: '#4CAF50'
                  }}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Slide>
  );

  return (
    <Fade in={true} timeout={800}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon sx={{ mr: 1, color: 'success.main', fontSize: 32 }} />
          <Typography variant="h5" component="h1" sx={{ color: '#2E7D32' }}>
            Alert Threshold Configuration
          </Typography>
        </Box>

        <Collapse in={saveStatus.show}>
          <Alert
            severity={saveStatus.severity}
            action={
              <IconButton
                size="small"
                onClick={() => setSaveStatus(prev => ({ ...prev, show: false }))}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 3 }}
            icon={saveStatus.severity === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
          >
            {saveStatus.message}
          </Alert>
        </Collapse>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <ThresholdCard
              title="Temperature"
              parameter="temperature"
              unit="°C"
              minRange={-10}
              maxRange={50}
              icon={<ThermostatIcon />}
              index={0}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ThresholdCard
              title="Humidity"
              parameter="humidity"
              unit="%"
              minRange={0}
              maxRange={100}
              icon={<HumidityIcon />}
              index={1}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ThresholdCard
              title="Light Level"
              parameter="lightLevel"
              unit="%"
              minRange={0}
              maxRange={100}
              icon={<LightbulbIcon />}
              index={2}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ThresholdCard
              title="Power Consumption"
              parameter="powerConsumption"
              unit="W"
              minRange={0}
              maxRange={500}
              icon={<PowerIcon />}
              index={3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ThresholdCard
              title="Voltage"
              parameter="voltage"
              unit="V"
              minRange={0}
              maxRange={300}
              icon={<VoltageIcon />}
              index={4}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RefreshIcon />}
            sx={{
              color: '#2E7D32',
              borderColor: '#2E7D32',
              '&:hover': {
                borderColor: '#1B5E20',
                backgroundColor: 'rgba(76, 175, 80, 0.04)'
              }
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#2E7D32'
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Thresholds'}
          </Button>
        </Box>

        <Fade in={true} timeout={1200}>
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 1,
            border: '1px solid #4CAF50'
          }}>
            <Typography variant="body2" sx={{ color: '#1B5E20' }}>
              <strong>Note:</strong> Alerts will be triggered when measured values 
              exceed these configured thresholds. You can disable monitoring for 
              specific parameters if needed.
            </Typography>
          </Box>
        </Fade>
      </Paper>
    </Fade>
  );
};

export default ConfigureThresholds;