import React, { useEffect, useState, useRef } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Fade,
  Slide,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  NotificationsOff as NotificationsOffIcon,
  DeviceThermostat as TemperatureIcon,
  Opacity as HumidityIcon,
  Lightbulb as LightIcon,
  FlashOn as PowerIcon,
  Bolt as VoltageIcon
} from '@mui/icons-material';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'info';
    default: return 'default';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'High': return <ErrorIcon />;
    case 'Medium': return <WarningIcon />;
    case 'Low': return <InfoIcon />;
    default: return <InfoIcon />;
  }
};

const getParameterIcon = (parameter) => {
  switch (parameter) {
    case 'temperature': return <TemperatureIcon />;
    case 'humidity': return <HumidityIcon />;
    case 'lightLevel': return <LightIcon />;
    case 'powerConsumption': return <PowerIcon />;
    case 'voltage': return <VoltageIcon />;
    default: return <InfoIcon />;
  }
};

const AlertsNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [previousAlerts, setPreviousAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({});
  const [posts, setPosts] = useState([]);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Son intégré en Base64 (bip court)
  const soundData = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAA";
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(soundData);
  }, []);

  // Charger les seuils
  useEffect(() => {
    const unsubscribeThresholds = onSnapshot(doc(db, 'thresholds', 'default'), (doc) => {
      if (doc.exists()) setThresholds(doc.data());
    });
    return () => unsubscribeThresholds();
  }, []);

  // Charger les postes
  useEffect(() => {
    const q = query(collection(db, 'postes'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribePosts();
  }, []);

  // Vérifier les seuils et générer des alertes
  useEffect(() => {
    if (Object.keys(thresholds).length === 0 || posts.length === 0) return;

    posts.forEach(post => {
      // Données locales
      if (post.localData) {
        ['temperature', 'humidity'].forEach(parameter => {
          if (thresholds[parameter]?.enabled && post.localData[parameter] !== undefined) {
            const value = post.localData[parameter];
            const min = thresholds[parameter].min;
            const max = thresholds[parameter].max;
            if (value < min || value > max) {
              createPostAlert(post, parameter, value, min, max, 'localData');
            }
          }
        });
      }

      // Données électriques
      if (post.electricalData) {
        Object.keys(post.electricalData).forEach(phase => {
          const phaseData = post.electricalData[phase];
          Object.keys(phaseData).forEach(parameter => {
            if (parameter === 'voltage' && thresholds.voltage?.enabled) {
              const value = parseFloat(phaseData[parameter].value);
              const min = thresholds.voltage.min;
              const max = thresholds.voltage.max;
              if (value < min || value > max) {
                createPostAlert(post, parameter, value, min, max, `electricalData.${phase}`);
              }
            }
          });
        });
      }
    });
  }, [thresholds, posts]);

  const createPostAlert = async (post, parameter, value, min, max, dataSource) => {
    const alertId = `${post.id}_${parameter}_${Date.now()}`;
    const alertRef = doc(db, 'alerts', alertId);
    const severity = 'High';
    const message = `${parameter} ${value < min ? 'too low' : 'too high'} on ${post.name || post.id}`;
    const description = `Current ${parameter}: ${value}. Allowed range: ${min} - ${max}.`;
    try {
      await setDoc(alertRef, {
        id: alertId,
        postId: post.id,
        postName: post.name,
        parameter,
        value,
        minThreshold: min,
        maxThreshold: max,
        message,
        description,
        severity,
        source: 'Post Monitoring',
        dataSource,
        read: false,
        createdAt: new Date(),
        location: post.position ? `${post.position.latitude}, ${post.position.longitude}` : 'Unknown'
      });
    } catch (error) {
      console.error('Error creating post alert:', error);
    }
  };

  // Charger les alertes et jouer le son si nouvelle alerte
  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Jouer son si nouvelle alerte et son activé
      if (previousAlerts.length > 0 && data.length > previousAlerts.length && soundEnabled) {
        audioRef.current?.play().catch(err => console.log("Audio error:", err));
      }

      setAlerts(data);
      setPreviousAlerts(data);

      const unread = data.filter(alert => !alert.read).length;
      setUnreadCount(unread);
    });
    return () => unsubscribe();
  }, [previousAlerts, soundEnabled]);

  const toggleExpand = (alertId) => {
    if (expandedAlert === alertId) setExpandedAlert(null);
    else {
      setExpandedAlert(alertId);
      markAsRead(alertId);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await updateDoc(doc(db, 'alerts', alertId), { read: true, readAt: new Date() });
    } catch (error) { console.error(error); }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.read);
      await Promise.all(unreadAlerts.map(alert =>
        updateDoc(doc(db, 'alerts', alert.id), { read: true, readAt: new Date() })
      ));
    } catch (error) { console.error(error); }
  };

  const deleteAlert = async (alertId) => {
    try { await deleteDoc(doc(db, 'alerts', alertId)); }
    catch (error) { console.error(error); }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.seconds) return 'Unknown date';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Fade in={true} timeout={800}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            </Badge>
            <Typography variant="h5">Alerts & Notifications</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={() => setSoundEnabled(prev => !prev)}
                  color="primary"
                />
              }
              label="Sound"
            />
          </Box>
          {unreadCount > 0 && (
            <Button variant="outlined" size="small" onClick={markAllAsRead} startIcon={<CheckCircleIcon />}>
              Mark all as read
            </Button>
          )}
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">No alerts</Typography>
            <Typography variant="body2" color="text.secondary">
              You're all caught up! New alerts will appear here when thresholds are exceeded.
            </Typography>
          </Box>
        ) : (
          <List>
            {alerts.map((alert, index) => (
              <Slide in={true} direction="up" timeout={(index + 1) * 100} key={alert.id}>
                <Card
                  variant="outlined"
                  sx={{
                    mb: 2,
                    overflow: 'hidden',
                    borderLeft: `4px solid ${theme.palette[getSeverityColor(alert.severity)]?.main || theme.palette.grey[400]}`,
                    backgroundColor: alert.read ? 'transparent' : 'action.hover'
                  }}
                >
                  <ListItem button onClick={() => toggleExpand(alert.id)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <Box sx={{ color: theme.palette[getSeverityColor(alert.severity)]?.main, mr: 2 }}>
                        {getParameterIcon(alert.parameter)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: alert.read ? 'normal' : 'bold' }}>
                              {alert.message}
                            </Typography>
                            {!alert.read && <Chip label="New" color="error" size="small" variant="dot" />}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">{formatTimestamp(alert.createdAt)}</Typography>
                            {alert.parameter && <Chip label={alert.parameter} size="small" variant="outlined" sx={{ ml: 1 }} />}
                            {alert.source && <Chip label={alert.source} size="small" variant="outlined" sx={{ ml: 1 }} />}
                          </Box>
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip icon={getSeverityIcon(alert.severity)} label={alert.severity} color={getSeverityColor(alert.severity)} variant="outlined" size="small" sx={{ mr: 1 }} />
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(alert.id); }}>
                        {expandedAlert === alert.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </ListItem>

                  <Collapse in={expandedAlert === alert.id} timeout="auto" unmountOnExit>
                    <CardContent sx={{ backgroundColor: 'grey.50', pt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" sx={{ mb: 2 }}>{alert.description || 'No additional details available.'}</Typography>
                          {alert.postId && <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Typography sx={{ fontWeight: 'bold', mr: 1 }}>Post ID:</Typography><Typography>{alert.postId}</Typography></Box>}
                          {alert.postName && <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Typography sx={{ fontWeight: 'bold', mr: 1 }}>Post Name:</Typography><Typography>{alert.postName}</Typography></Box>}
                          {alert.value !== undefined && <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Typography sx={{ fontWeight: 'bold', mr: 1 }}>Current Value:</Typography><Typography color="error.main">{alert.value}</Typography></Box>}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          {alert.minThreshold !== undefined && alert.maxThreshold !== undefined && <Box sx={{ mb: 2 }}><Typography sx={{ fontWeight: 'bold', mb: 1 }}>Threshold Range:</Typography><Typography>{alert.minThreshold} - {alert.maxThreshold}</Typography></Box>}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><Typography sx={{ fontWeight: 'bold', mr: 1 }}>Created:</Typography><Typography>{alert.createdAt?.seconds ? new Date(alert.createdAt.seconds * 1000).toLocaleString() : 'Unknown date'}</Typography></Box>
                          {alert.read && alert.readAt && <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}><Typography sx={{ fontWeight: 'bold', mr: 1 }}>Read:</Typography><Typography>{formatTimestamp(alert.readAt)}</Typography></Box>}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {!alert.read && <Button size="small" variant="outlined" onClick={() => markAsRead(alert.id)} startIcon={<CheckCircleIcon />}>Mark as read</Button>}
                            <Button size="small" color="error" variant="outlined" onClick={() => deleteAlert(alert.id)} startIcon={<DeleteIcon />}>Delete</Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Collapse>
                </Card>
              </Slide>
            ))}
          </List>
        )}
      </Paper>
    </Fade>
  );
};

export default AlertsNotifications;
