import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  IconButton,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
  Fade,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Delete,
  Edit,
  Save,
  Cancel,
  Add,
  Warning,
  Error as ErrorIcon,
  Info,
  NewReleases,
} from '@mui/icons-material';
import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { styled } from '@mui/material/styles';

const SEVERITY_LEVELS = [
  { value: 'Low', label: 'Low', color: '#4caf50', icon: <Info /> },
  { value: 'Medium', label: 'Medium', color: '#ff9800', icon: <Warning /> },
  { value: 'High', label: 'High', color: '#f44336', icon: <ErrorIcon /> },
  { value: 'Critical', label: 'Critical', color: '#ba000d', icon: <NewReleases /> },
];

// Composants stylisés
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 800,
  margin: 'auto',
  background: 'linear-gradient(135deg, #f5f9f4 0%, #e8f5e9 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 100, 0, 0.1)',
}));

const AddAlertCard = styled(Card)(({ theme }) => ({
  background: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)',
  },
}));

const AlertItem = styled(Card)(({ theme, severity }) => {
  const severityObj = SEVERITY_LEVELS.find(s => s.value === severity) || SEVERITY_LEVELS[0];
  return {
    marginBottom: theme.spacing(2),
    borderLeft: `4px solid ${severityObj.color}`,
    borderRadius: '8px',
    background: 'white',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 12px ${alpha(severityObj.color, 0.2)}`,
    },
  };
});

const GreenButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2e7d32 0%, #4caf50 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '8px',
  padding: '8px 20px',
  textTransform: 'none',
  boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1b5e20 0%, #388e3c 100%)',
    boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)',
  },
}));

const OutlinedGreenButton = styled(Button)(({ theme }) => ({
  color: '#2e7d32',
  borderColor: '#2e7d32',
  fontWeight: 500,
  borderRadius: '8px',
  padding: '8px 16px',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#1b5e20',
    backgroundColor: 'rgba(76, 175, 80, 0.04)',
  },
}));

const AlertProject = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    severity: '',
  });
  const [editAlertId, setEditAlertId] = useState(null);
  const [editAlertData, setEditAlertData] = useState({
    title: '',
    description: '',
    severity: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expanded, setExpanded] = useState(false);

  const alertsRef = collection(db, 'projectAlerts');

  // Charger les alertes au montage
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const snapshot = await getDocs(alertsRef);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAlerts(data);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setSnackbar({ open: true, message: 'Failed to load alerts', severity: 'error' });
      }
    };
    fetchAlerts();
  }, []);

  // Gestion changement formulaire ajout
  const handleNewAlertChange = (e) => {
    const { name, value } = e.target;
    setNewAlert(prev => ({ ...prev, [name]: value }));
  };

  // Ajouter une alerte
  const handleAddAlert = async () => {
    if (!newAlert.title || !newAlert.description || !newAlert.severity) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'warning' });
      return;
    }
    try {
      const date = new Date().toISOString();
      const docRef = await addDoc(alertsRef, { ...newAlert, date });
      setAlerts([...alerts, { id: docRef.id, ...newAlert, date }]);
      setNewAlert({ title: '', description: '', severity: '' });
      setExpanded(false);
      setSnackbar({ open: true, message: 'Alert added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding alert:', error);
      setSnackbar({ open: true, message: 'Failed to add alert', severity: 'error' });
    }
  };

  // Supprimer une alerte
  const handleDeleteAlert = async (id) => {
    try {
      await deleteDoc(doc(alertsRef, id));
      setAlerts(alerts.filter(alert => alert.id !== id));
      setSnackbar({ open: true, message: 'Alert deleted', severity: 'info' });
    } catch (error) {
      console.error('Error deleting alert:', error);
      setSnackbar({ open: true, message: 'Failed to delete alert', severity: 'error' });
    }
  };

  // Modifier une alerte (activer mode édition)
  const handleEditAlert = (alert) => {
    setEditAlertId(alert.id);
    setEditAlertData({ title: alert.title, description: alert.description, severity: alert.severity });
  };

  // Changement formulaire édition
  const handleEditAlertChange = (e) => {
    const { name, value } = e.target;
    setEditAlertData(prev => ({ ...prev, [name]: value }));
  };

  // Sauvegarder édition
  const handleSaveAlert = async () => {
    if (!editAlertData.title || !editAlertData.description || !editAlertData.severity) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'warning' });
      return;
    }
    try {
      const alertRef = doc(alertsRef, editAlertId);
      await updateDoc(alertRef, editAlertData);
      setAlerts(alerts.map(alert => (alert.id === editAlertId ? { ...alert, ...editAlertData } : alert)));
      setEditAlertId(null);
      setSnackbar({ open: true, message: 'Alert updated', severity: 'success' });
    } catch (error) {
      console.error('Error updating alert:', error);
      setSnackbar({ open: true, message: 'Failed to update alert', severity: 'error' });
    }
  };

  // Annuler édition
  const handleCancelEdit = () => {
    setEditAlertId(null);
  };

  const getSeverityIcon = (severity) => {
    const severityObj = SEVERITY_LEVELS.find(s => s.value === severity);
    return severityObj ? severityObj.icon : <Warning />;
  };

  const getSeverityColor = (severity) => {
    const severityObj = SEVERITY_LEVELS.find(s => s.value === severity);
    return severityObj ? severityObj.color : '#4caf50';
  };

  return (
    <StyledPaper elevation={0}>
      <Box display="flex" alignItems="center" mb={3}>
        <NewReleases sx={{ color: '#2e7d32', fontSize: 32, mr: 2 }} />
        <Typography variant="h4" fontWeight="600" color="#2e7d32">
          Project Alerts Management
        </Typography>
      </Box>

      <AddAlertCard>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={expanded ? 2 : 0}>
            <Typography variant="h6" color="#2e7d32">
              Add New Alert
            </Typography>
            <IconButton 
              onClick={() => setExpanded(!expanded)}
              sx={{ 
                backgroundColor: expanded ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
              }}
            >
              <Add sx={{ color: '#2e7d32' }} />
            </IconButton>
          </Box>

          <Slide in={expanded} direction="down" mountOnEnter unmountOnExit>
            <Box>
              <TextField
                label="Title"
                name="title"
                value={newAlert.title}
                onChange={handleNewAlertChange}
                fullWidth
                margin="normal"
                variant="outlined"
                size="small"
              />
              <TextField
                label="Description"
                name="description"
                value={newAlert.description}
                onChange={handleNewAlertChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                variant="outlined"
                size="small"
              />
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Severity Level</InputLabel>
                <Select
                  name="severity"
                  value={newAlert.severity}
                  onChange={handleNewAlertChange}
                  label="Severity Level"
                >
                  {SEVERITY_LEVELS.map(level => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box display="flex" alignItems="center">
                        <Box sx={{ color: level.color, mr: 1 }}>
                          {level.icon}
                        </Box>
                        {level.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <GreenButton 
                onClick={handleAddAlert} 
                sx={{ mt: 2 }}
                startIcon={<Add />}
              >
                Add Alert
              </GreenButton>
            </Box>
          </Slide>
        </CardContent>
      </AddAlertCard>

      <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', mb: 2 }}>
        Existing Alerts ({alerts.length})
      </Typography>

      {alerts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
          <Warning sx={{ fontSize: 48, color: 'rgba(0, 0, 0, 0.2)', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No alerts found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Click the + button above to create your first alert
          </Typography>
        </Paper>
      ) : (
        <List>
          {alerts.map(alert => (
            <Fade in={true} key={alert.id}>
              <AlertItem severity={alert.severity}>
                <CardContent sx={{ py: 2 }}>
                  {editAlertId === alert.id ? (
                    <Box>
                      <TextField
                        label="Title"
                        name="title"
                        value={editAlertData.title}
                        onChange={handleEditAlertChange}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        size="small"
                      />
                      <TextField
                        label="Description"
                        name="description"
                        value={editAlertData.description}
                        onChange={handleEditAlertChange}
                        fullWidth
                        multiline
                        rows={2}
                        margin="dense"
                        variant="outlined"
                        size="small"
                      />
                      <FormControl fullWidth margin="dense" size="small">
                        <InputLabel>Severity Level</InputLabel>
                        <Select
                          name="severity"
                          value={editAlertData.severity}
                          onChange={handleEditAlertChange}
                          label="Severity Level"
                        >
                          {SEVERITY_LEVELS.map(level => (
                            <MenuItem key={level.value} value={level.value}>
                              <Box display="flex" alignItems="center">
                                <Box sx={{ color: level.color, mr: 1 }}>
                                  {level.icon}
                                </Box>
                                {level.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box mt={1} display="flex" gap={1}>
                        <GreenButton 
                          onClick={handleSaveAlert} 
                          startIcon={<Save />}
                          size="small"
                        >
                          Save
                        </GreenButton>
                        <OutlinedGreenButton 
                          onClick={handleCancelEdit}
                          startIcon={<Cancel />}
                          size="small"
                        >
                          Cancel
                        </OutlinedGreenButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Box display="flex" alignItems="center" mb={0.5}>
                            {getSeverityIcon(alert.severity)}
                            <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                              {alert.title}
                            </Typography>
                          </Box>
                          <Chip 
                            label={alert.severity} 
                            size="small" 
                            sx={{ 
                              backgroundColor: getSeverityColor(alert.severity),
                              color: 'white',
                              fontWeight: 500,
                              mb: 1
                            }} 
                          />
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {alert.description}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton 
                            onClick={() => handleEditAlert(alert)} 
                            size="small"
                            sx={{ color: '#2e7d32' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDeleteAlert(alert.id)} 
                            size="small" 
                            sx={{ color: '#f44336' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="textSecondary">
                        Created: {new Date(alert.date).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </AlertItem>
            </Fade>
          ))}
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default AlertProject;