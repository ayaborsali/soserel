import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Box,
  Collapse,
  Card,
  CardContent,
  Grid,
  Slide,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  WbSunny as SunIcon,
  Power as PowerIcon
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const DeviceList = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDevice, setExpandedDevice] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'devices'));
        const deviceData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDevices(deviceData);
        setFilteredDevices(deviceData);
      } catch (error) {
        console.error('❌ Error loading devices:', error);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const filtered = devices.filter(device => 
      device.lampId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.lineId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.postId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.addedBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDevices(filtered);
  }, [searchTerm, devices]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleExpand = (deviceId) => {
    if (expandedDevice === deviceId) {
      setExpandedDevice(null);
    } else {
      setExpandedDevice(deviceId);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Fade in={true} timeout={800}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
            Lamp List (Devices)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredDevices.length} {filteredDevices.length === 1 ? 'lamp found' : 'lamps found'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a lamp..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <List>
          {filteredDevices.map((device, index) => (
            <Slide in={true} direction="up" timeout={(index + 1) * 100} key={device.id}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem 
                  button 
                  onClick={() => toggleExpand(device.id)}
                  sx={{ 
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <LightbulbIcon 
                      sx={{ 
                        mr: 2, 
                        color: device.lampState === "1" ? 'warning.main' : 'text.secondary',
                        fontSize: 32
                      }} 
                    />
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                            {device.lampId || 'Undefined ID'}
                          </Typography>
                          <Chip 
                            icon={<PowerIcon />}
                            label={device.lampState === "1" ? 'On' : 'Off'} 
                            size="small"
                            color={device.lampState === "1" ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            {device.lineId || 'Line not specified'}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                  {expandedDevice === device.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItem>

                <Collapse in={expandedDevice === device.id} timeout="auto" unmountOnExit>
                  <CardContent sx={{ backgroundColor: 'grey.50', pt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SunIcon sx={{ mr: 1, color: 'warning.main' }} />
                          <Typography variant="body2">
                            Light level: <strong>{device.lightLevel || 'N/A'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            Position: <strong>
                              {device.location ? `${device.location.lat?.toFixed(6) || 'N/A'}, ${device.location.lng?.toFixed(6) || 'N/A'}` : 'Not specified'}
                            </strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                          <Typography variant="body2">
                            Added by: <strong>{device.addedBy || 'Unknown'}</strong>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="body2">
                            Added at: <strong>{device.addedAt ? formatDate(device.addedAt) : 'Unknown date'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2">
                            Post ID: <strong>{device.postId || 'Not specified'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2">
                            Document ID: <strong>{device.id}</strong>
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

        {filteredDevices.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No lamps found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try modifying your search criteria
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );
};

export default DeviceList;