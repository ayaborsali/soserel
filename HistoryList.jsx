import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Fade,
  Slide,
  Card,
  CardContent,
  Grid,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  History as HistoryIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Lightbulb as LightbulbIcon,
  Power as PowerIcon,
  WbSunny as SunIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Inactive': return 'default';
    case 'Faulty': return 'error';
    default: return 'warning';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Active': return <PowerIcon sx={{ color: 'success.main' }} />;
    case 'Inactive': return <PowerIcon sx={{ color: 'text.secondary' }} />;
    case 'Faulty': return <InfoIcon sx={{ color: 'error.main' }} />;
    default: return <InfoIcon sx={{ color: 'warning.main' }} />;
  }
};

const formatLocation = (location) => {
  if (!location) return 'Location unknown';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    if (location.lat !== undefined && location.lng !== undefined) {
      return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }
  }
  
  return 'Invalid location format';
};

const formatActionType = (message) => {
  if (!message) return 'Unknown action';
  
  if (message.includes('LAMP_01')) return 'Lamp control action';
  if (message.includes('added') || message.includes('created')) return 'Device added';
  if (message.includes('updated') || message.includes('modified')) return 'Device updated';
  if (message.includes('removed') || message.includes('deleted')) return 'Device removed';
  if (message.includes('state') || message.includes('status')) return 'Status change';
  
  return 'System action';
};

const getActionIcon = (message) => {
  const actionType = formatActionType(message);
  
  switch (actionType) {
    case 'Lamp control action': return <LightbulbIcon sx={{ color: 'warning.main' }} />;
    case 'Device added': return <PowerIcon sx={{ color: 'success.main' }} />;
    case 'Device updated': return <InfoIcon sx={{ color: 'info.main' }} />;
    case 'Device removed': return <InfoIcon sx={{ color: 'error.main' }} />;
    case 'Status change': return <SunIcon sx={{ color: 'primary.main' }} />;
    default: return <HistoryIcon sx={{ color: 'text.secondary' }} />;
  }
};

const HistoryList = () => {
  const [logs, setLogs] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const q = query(collection(db, 'history'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const toggleExpand = (logId) => {
    if (expandedLog === logId) {
      setExpandedLog(null);
    } else {
      setExpandedLog(logId);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp?.seconds) return 'Unknown date';
    
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString();
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HistoryIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h5" component="h1">
            Activity History
          </Typography>
          <Chip 
            label={`${logs.length} events`} 
            color="primary" 
            variant="outlined" 
            sx={{ ml: 2 }} 
          />
        </Box>

        {logs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No activity found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your activity history will appear here
            </Typography>
          </Box>
        ) : (
          <List>
            {logs.map((log, index) => (
              <Slide in={true} direction="up" timeout={(index + 1) * 100} key={log.id}>
                <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                  <ListItem 
                    button 
                    onClick={() => toggleExpand(log.id)}
                    sx={{ 
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <Box sx={{ mr: 2 }}>
                        {getActionIcon(log.message)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" component="span" sx={{ mr: 1 }}>
                              {formatActionType(log.message)}
                            </Typography>
                            <Chip 
                              icon={getStatusIcon(log.status)}
                              label={log.status || 'Unknown'} 
                              size="small"
                              color={getStatusColor(log.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="body2" component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                              {log.timestamp?.seconds
                                ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                                : 'Unknown date'}
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(log.id);
                      }}
                    >
                      {expandedLog === log.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItem>

                  <Collapse in={expandedLog === log.id} timeout="auto" unmountOnExit>
                    <CardContent sx={{ backgroundColor: 'grey.50', pt: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Action Details:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {log.message || 'No message available'}
                            </Typography>
                          </Box>
                          
                          {log.user && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                              <Typography variant="body2">
                                User: <strong>{log.user}</strong>
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          {log.location && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  Location:
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatLocation(log.location)}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="body2">
                              Full timestamp: <strong>
                                {log.timestamp?.seconds
                                  ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                                  : 'Unknown date'}
                              </strong>
                            </Typography>
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

export default HistoryList;