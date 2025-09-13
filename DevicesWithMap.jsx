import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider,
  Fade,
  Slide,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  WbSunny as SunIcon,
  Power as PowerIcon,
  GpsFixed as GpsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';

// Custom icons
const icons = {
  Active: new L.Icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png',
    iconSize: [30, 30],
  }),
  Inactive: new L.Icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    iconSize: [30, 30],
  }),
};

// To dynamically center the map
const FlyToMarker = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      map.flyTo(position, 15);
    }
  }, [position]);
  return null;
};

const DeviceMapView = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState(null);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const currentUserEmail = auth.currentUser?.email;

  useEffect(() => {
    const q = query(collection(db, 'devices'), where('addedBy', '==', currentUserEmail));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const location = doc.data().location;
        let position = [36.8, 10.98]; // default value

        // Check if location is string "lat,lng"
        if (typeof location === 'string' && location.includes(',')) {
          const coords = location.split(',').map(Number);
          if (coords.length === 2 && coords.every((n) => !isNaN(n))) position = coords;
        }

        // Check if location is object {lat, lng}
        if (location && typeof location === 'object' && 'lat' in location && 'lng' in location) {
          position = [location.lat, location.lng];
        }

        return {
          id: doc.id,
          ...doc.data(),
          position,
        };
      });
      setDevices(data);
      setFilteredDevices(data);
    });
    return () => unsubscribe();
  }, [currentUserEmail]);

  useEffect(() => {
    const filtered = devices.filter(device => 
      device.lampId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.lineId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.postId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.addedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.lampState === "1" ? 'on' : 'off').includes(searchTerm.toLowerCase())
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
    <Box display="flex" gap={2} p={2} height="85vh">
      {/* Devices list */}
      <Paper sx={{ width: '30%', p: 2, overflowY: 'auto', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
          My Lamps
        </Typography>
        
        {/* Search bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a lamp..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredDevices.length} {filteredDevices.length === 1 ? 'lamp found' : 'lamps found'}
        </Typography>

        <List>
          {filteredDevices.map((device, index) => (
            <Slide in={true} direction="up" timeout={(index + 1) * 100} key={device.id}>
              <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem 
                  button 
                  onClick={() => {
                    setSelectedPos(device.position);
                    toggleExpand(device.id);
                  }}
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
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(device.id);
                    }}
                  >
                    {expandedDevice === device.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
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
                              {device.position ? `${device.position[0]?.toFixed(6) || 'N/A'}, ${device.position[1]?.toFixed(6) || 'N/A'}` : 'Not specified'}
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
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      <Chip
                        icon={<GpsIcon />}
                        label="View on map"
                        color="primary"
                        variant="outlined"
                        onClick={() => setSelectedPos(device.position)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Box>
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
              {searchTerm ? 'No lamps found' : 'No lamps'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try modifying your search criteria' : 'Your lamps will appear here'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Leaflet map */}
      <Box flex={1}>
        <Fade in={true} timeout={1000}>
          <Paper sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer 
              center={[36.8, 10.98]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredDevices.map((device) => (
                <Marker
                  key={device.id}
                  position={device.position}
                  icon={device.lampState === "1" ? icons.Active : icons.Inactive}
                >
                  <Popup>
                    <Box sx={{ p: 1, minWidth: 200 }}>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightbulbIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {device.lampId || 'Unnamed lamp'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Status:</strong> {device.lampState === "1" ? 'On' : 'Off'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Brightness:</strong> {device.lightLevel || 'N/A'}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Line:</strong> {device.lineId || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Position:</strong> {device.position[0]?.toFixed(6)}, {device.position[1]?.toFixed(6)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Added by:</strong> {device.addedBy || 'Unknown'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {device.addedAt ? formatDate(device.addedAt) : 'Unknown'}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              ))}
              {selectedPos && <FlyToMarker position={selectedPos} />}
            </MapContainer>
          </Paper>
        </Fade>
      </Box>
    </Box>
  );
};

export default DeviceMapView;