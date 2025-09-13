import React, { useEffect, useState, useRef } from 'react';
import {
  Box, TextField, Button, Typography, MenuItem, Alert, Grid,
  Card, CardContent, Paper, InputAdornment, IconButton, Chip,
  FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { db } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import {
  Refresh, LocationOn, ElectricBolt, Transform, Sensors,
  Info, CheckCircle, MyLocation, FolderSpecial, People, Map, Description
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onLocationSelect, disabled, bounds }) {
  const map = useMapEvents({
    click(e) {
      if (!disabled && bounds) {
        // Vérifier si le point cliqué est dans les limites
        if (isPointInBounds(e.latlng, bounds)) {
          onLocationSelect(e.latlng);
        } else {
          // Recentrer la carte sur la zone si on clique en dehors
          map.setView([
            (bounds.south + bounds.north) / 2,
            (bounds.west + bounds.east) / 2
          ], map.getZoom());
        }
      }
    },
  });
  
  return null;
}

// Fonction pour vérifier si un point est dans les limites
function isPointInBounds(point, bounds) {
  if (!bounds || !bounds.north || !bounds.south || !bounds.east || !bounds.west) return true;
  
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

// Function to generate a unique token
const generateToken = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `post_${timestamp}_${randomStr}`.toUpperCase();
};

const AddPost = () => {
  const [postName, setPostName] = useState('');
  const [token, setToken] = useState('');
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('');
  const [zoneDetails, setZoneDetails] = useState(null);
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [temperatureLocal, setTemperatureLocal] = useState('');
  const [humidity, setHumidity] = useState('');
  const [smoke, setSmoke] = useState('');
  const [flame, setFlame] = useState('');
  const [door, setDoor] = useState('');

  const [temperatureTransfo, setTemperatureTransfo] = useState('');
  const [buchholz1, setBuchholz1] = useState('');
  const [buchholz2, setBuchholz2] = useState('');
  const [seuil1, setSeuil1] = useState('');
  const [seuil2, setSeuil2] = useState('');

  // Electrical parameters with tolerance
  const [voltageL1, setVoltageL1] = useState({ value: '', tolerance: '' });
  const [currentL1, setCurrentL1] = useState({ value: '', tolerance: '' });
  const [powerL1, setPowerL1] = useState({ value: '', tolerance: '' });
  const [pfL1, setPfL1] = useState({ value: '', tolerance: '' });

  const [voltageL2, setVoltageL2] = useState({ value: '', tolerance: '' });
  const [currentL2, setCurrentL2] = useState({ value: '', tolerance: '' });
  const [powerL2, setPowerL2] = useState({ value: '', tolerance: '' });
  const [pfL2, setPfL2] = useState({ value: '', tolerance: '' });

  const [voltageL3, setVoltageL3] = useState({ value: '', tolerance: '' });
  const [currentL3, setCurrentL3] = useState({ value: '', tolerance: '' });
  const [powerL3, setPowerL3] = useState({ value: '', tolerance: '' });
  const [pfL3, setPfL3] = useState({ value: '', tolerance: '' });

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mapCenter, setMapCenter] = useState([36.7525, 3.0420]); // Centre par défaut (Alger)
  const [mapZoom, setMapZoom] = useState(10);
  const [mapBounds, setMapBounds] = useState(null);
  const mapRef = useRef();

  // Options for smoke, flame and door status
  const smokeOptions = [
    { value: '0', label: 'No Smoke' },
    { value: '1', label: 'Low Level' },
    { value: '2', label: 'Medium Level' },
    { value: '3', label: 'High Level' },
    { value: '4', label: 'Critical Level' }
  ];

  const flameOptions = [
    { value: '0', label: 'No Flame' },
    { value: '1', label: 'Flame Detected' },
    { value: '2', label: 'High Intensity' }
  ];

  const doorOptions = [
    { value: '0', label: 'Closed' },
    { value: '1', label: 'Open' },
    { value: '2', label: 'Unsecured' }
  ];

  // Tolerance options
  const toleranceOptions = [
    { value: '0.5', label: '±0.5%' },
    { value: '1', label: '±1%' },
    { value: '2', label: '±2%' },
    { value: '5', label: '±5%' },
    { value: '10', label: '±10%' }
  ];

  // Generate a token automatically when component loads
  useEffect(() => {
    setToken(generateToken());
  }, []);

  // Fetch zones from Firestore
  useEffect(() => {
    const fetchZones = async () => {
      try {
        setLoadingZones(true);
        const zonesCollection = collection(db, 'zones');
        const zonesSnapshot = await getDocs(zonesCollection);
        const zonesList = zonesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setZones(zonesList);
        
        if (zonesList.length === 1) {
          setSelectedZone(zonesList[0].id);
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
        setError("Failed to load zones. Please try again later.");
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  const selectedZoneObj = zones.find(z => z.id === selectedZone);

  // Fetch details for the selected zone
  useEffect(() => {
    if (selectedZone) {
      const zone = zones.find(z => z.id === selectedZone);
      setZoneDetails(zone);
      
      // Configurer la carte en fonction de la zone sélectionnée
      if (zone && zone.bounds) {
        setMapBounds(zone.bounds);
        setMapCenter([
          (zone.bounds.south + zone.bounds.north) / 2,
          (zone.bounds.west + zone.bounds.east) / 2
        ]);
        setMapZoom(10);
      } else if (zone && zone.position) {
        setMapCenter([zone.position.latitude, zone.position.longitude]);
        setMapZoom(10);
        setMapBounds(null);
      }
    }
  }, [selectedZone, zones]);

  // Effect pour restreindre la carte aux limites de la zone
  useEffect(() => {
    if (mapRef.current && mapBounds) {
      const map = mapRef.current;
      map.setMaxBounds([
        [mapBounds.south, mapBounds.west],
        [mapBounds.north, mapBounds.east]
      ]);
    }
  }, [mapBounds, selectedZone]);

  // Function to regenerate a token
  const regenerateToken = () => {
    setToken(generateToken());
  };

  const handleZoneChange = (event) => {
    setSelectedZone(event.target.value);
    setError('');
  };

  const handleViewZoneInfo = () => {
    setZoneDialogOpen(true);
  };

  const handleLocationSelect = (latlng) => {
    if (mapBounds && !isPointInBounds(latlng, mapBounds)) {
      setError('Veuillez sélectionner un emplacement dans la zone ' + selectedZoneObj.name);
      return;
    }
    
    setLatitude(latlng.lat);
    setLongitude(latlng.lng);
    setError('');
  };

  // Fonction pour utiliser la géolocalisation du navigateur
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Vérifier si la position actuelle est dans les limites
          if (mapBounds && !isPointInBounds({lat: latitude, lng: longitude}, mapBounds)) {
            setError('Votre position actuelle n\'est pas dans la zone sélectionnée');
            return;
          }
          
          setLatitude(latitude);
          setLongitude(longitude);
          setError('');
          
          // Centrer la carte sur la position actuelle
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
        },
        (error) => {
          setError('Impossible d\'obtenir votre position: ' + error.message);
        }
      );
    } else {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!postName || !token || !selectedZone || !latitude || !longitude) {
      setError('Please fill all required fields!');
      setSubmitting(false);
      return;
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Please enter valid coordinates (latitude: -90 to 90, longitude: -180 to 180)');
      setSubmitting(false);
      return;
    }

    // Vérifier si les coordonnées sont dans les limites de la zone
    if (mapBounds && !isPointInBounds({lat, lng}, mapBounds)) {
      setError('Les coordonnées doivent être dans la zone sélectionnée: ' + selectedZoneObj.name);
      setSubmitting(false);
      return;
    }

    try {
      // Prepare post data
      const postData = {
        name: postName,
        token: token,
        zoneId: selectedZone,
        zoneName: selectedZoneObj?.name || '',
        position: {
          latitude: lat,
          longitude: lng
        },
        localData: {
          temperature: temperatureLocal || 0,
          humidity: humidity || 0,
          smoke: smoke || '0',
          flame: flame || '0',
          door: door || '0'
        },
        transformerData: {
          temperature: temperatureTransfo || 0,
          buchholz1: buchholz1 || 0,
          buchholz2: buchholz2 || 0,
          threshold1: seuil1 || 0,
          threshold2: seuil2 || 0
        },
        electricalData: {
          L1: {
            voltage: {
              value: voltageL1.value || 0,
              tolerance: voltageL1.tolerance || '0'
            },
            current: {
              value: currentL1.value || 0,
              tolerance: currentL1.tolerance || '0'
            },
            power: {
              value: powerL1.value || 0,
              tolerance: powerL1.tolerance || '0'
            },
            powerFactor: {
              value: pfL1.value || 0,
              tolerance: pfL1.tolerance || '0'
            }
          },
          L2: {
            voltage: {
              value: voltageL2.value || 0,
              tolerance: voltageL2.tolerance || '0'
            },
            current: {
              value: currentL2.value || 0,
              tolerance: currentL2.tolerance || '0'
            },
            power: {
              value: powerL2.value || 0,
              tolerance: powerL2.tolerance || '0'
            },
            powerFactor: {
              value: pfL2.value || 0,
              tolerance: pfL2.tolerance || '0'
            }
          },
          L3: {
            voltage: {
              value: voltageL3.value || 0,
              tolerance: voltageL3.tolerance || '0'
            },
            current: {
              value: currentL3.value || 0,
              tolerance: currentL3.tolerance || '0'
            },
            power: {
              value: powerL3.value || 0,
              tolerance: powerL3.tolerance || '0'
            },
            powerFactor: {
              value: pfL3.value || 0,
              tolerance: pfL3.tolerance || '0'
            }
          }
        },
        createdAt: new Date(),
        status: 'active'
      };

      // Add post to the "postes" collection in Firestore
      const docRef = await addDoc(collection(db, 'postes'), postData);
      
      setSuccess(`Post added successfully with ID: ${docRef.id} ✅`);

      // Reset fields
      setPostName(''); 
      setToken(generateToken());
      setSelectedZone(''); 
      setLatitude('');
      setLongitude('');
      setTemperatureLocal(''); setHumidity(''); setSmoke(''); setFlame(''); setDoor('');
      setTemperatureTransfo(''); setBuchholz1(''); setBuchholz2(''); setSeuil1(''); setSeuil2('');
      
      // Reset electrical parameters with tolerance
      setVoltageL1({ value: '', tolerance: '' }); setCurrentL1({ value: '', tolerance: '' }); 
      setPowerL1({ value: '', tolerance: '' }); setPfL1({ value: '', tolerance: '' });
      setVoltageL2({ value: '', tolerance: '' }); setCurrentL2({ value: '', tolerance: '' }); 
      setPowerL2({ value: '', tolerance: '' }); setPfL2({ value: '', tolerance: '' });
      setVoltageL3({ value: '', tolerance: '' }); setCurrentL3({ value: '', tolerance: '' }); 
      setPowerL3({ value: '', tolerance: '' }); setPfL3({ value: '', tolerance: '' });

    } catch (err) {
      console.error(err);
      setError(err.message || "Error adding post ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to render electrical parameter fields with tolerance
  const renderElectricalField = (label, value, setValue, unit, line) => (
    <Grid container spacing={1} alignItems="center">
      <Grid item xs={7}>
        <TextField
          fullWidth
          label={`${label} (${unit})`}
          value={value.value}
          onChange={e => setValue({...value, value: e.target.value})}
          type="number"
        />
      </Grid>
      <Grid item xs={5}>
        <FormControl fullWidth>
          <InputLabel>Tolerance</InputLabel>
          <Select
            value={value.tolerance}
            label="Tolerance"
            onChange={e => setValue({...value, tolerance: e.target.value})}
          >
            {toleranceOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  // Fonction pour obtenir les coordonnées du polygone de délimitation
  const getBoundsPolygon = (bounds) => {
    if (!bounds) return null;
    
    return [
      [bounds.north, bounds.west],
      [bounds.north, bounds.east],
      [bounds.south, bounds.east],
      [bounds.south, bounds.west]
    ];
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center' }}>
        <ElectricBolt sx={{ mr: 1, fontSize: '2rem' }} /> Add New Electrical Post
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} /> Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField 
                        fullWidth 
                        label="Post Name" 
                        value={postName} 
                        onChange={e => setPostName(e.target.value)} 
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#2e7d32',
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField 
                          fullWidth 
                          label="Security Token" 
                          value={token} 
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={regenerateToken} sx={{ color: '#2e7d32' }}>
                                  <Refresh />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          helperText="Automatically generated token"
                          required
                        />
                      </Box>
                    </Grid>
                    
                    {/* Zone Selection */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl fullWidth required>
                          <InputLabel>Select Zone</InputLabel>
                          <Select
                            value={selectedZone}
                            label="Select Zone"
                            onChange={handleZoneChange}
                            disabled={loadingZones || zones.length === 0}
                            sx={{ minWidth: 200 }}
                          >
                            {zones.map(zone => (
                              <MenuItem key={zone.id} value={zone.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FolderSpecial sx={{ mr: 1, color: '#2e7d32' }} />
                                  {zone.name}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button 
                          variant="outlined" 
                          onClick={handleViewZoneInfo}
                          disabled={!selectedZone}
                          startIcon={<Info />}
                          sx={{ 
                            whiteSpace: 'nowrap',
                            color: '#2e7d32',
                            borderColor: '#2e7d32',
                            '&:hover': {
                              borderColor: '#1b5e20',
                              backgroundColor: 'rgba(46, 125, 50, 0.04)'
                            }
                          }}
                        >
                          Zone Details
                        </Button>
                      </Box>
                      {loadingZones ? (
                        <Typography variant="body2" sx={{ mt: 1, color: '#2e7d32' }}>
                          Loading available zones...
                        </Typography>
                      ) : !zones.length ? (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          No zones available. Please create zones in the database first.
                        </Typography>
                      ) : null}
                    </Grid>
                    
                    {selectedZoneObj && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            icon={<CheckCircle />} 
                            label={`Selected: ${selectedZoneObj.name}`} 
                            color="success" 
                            variant="outlined" 
                          />
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <MyLocation sx={{ fontSize: 16, mr: 0.5 }} />
                            Capital: {selectedZoneObj.capital || 'Not specified'}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Coordinates Input */}
            <Grid item xs={12}>
              <Card sx={{ border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <MyLocation sx={{ mr: 1 }} /> Location Coordinates
                  </Typography>
                  
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                      Sélectionnez un emplacement sur la carte:
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={handleUseCurrentLocation}
                      startIcon={<MyLocation />}
                      sx={{ 
                        color: '#2e7d32', 
                        borderColor: '#2e7d32',
                        '&:hover': { borderColor: '#1b5e20' }
                      }}
                    >
                      Utiliser ma position
                    </Button>
                  </Box>

                  {!selectedZone ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Veuillez d'abord sélectionner une zone pour activer la carte.
                    </Alert>
                  ) : (
                    <>
                      <Box sx={{ height: '400px', width: '100%', position: 'relative', mb: 2 }}>
                        <MapContainer
                          center={mapCenter}
                          zoom={mapZoom}
                          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                          ref={mapRef}
                          scrollWheelZoom={true}
                          // RESTREINDRE LA CARTE À LA ZONE
                          maxBounds={mapBounds ? [
                            [mapBounds.south, mapBounds.west],
                            [mapBounds.north, mapBounds.east]
                          ] : null}
                          maxBoundsViscosity={1.0}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          
                          {/* Afficher les limites de la zone si disponibles */}
                          {mapBounds && getBoundsPolygon(mapBounds) && (
                            <Polygon
                              positions={getBoundsPolygon(mapBounds)}
                              pathOptions={{ color: 'blue', fillOpacity: 0.1 }}
                            />
                          )}
                          
                          {latitude && longitude && (
                            <Marker position={[latitude, longitude]} />
                          )}
                          
                          <MapClickHandler 
                            onLocationSelect={handleLocationSelect} 
                            disabled={!selectedZone}
                            bounds={mapBounds}
                          />
                        </MapContainer>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Latitude"
                            value={latitude}
                            onChange={e => setLatitude(e.target.value)}
                            type="number"
                            inputProps={{ step: "0.000001", min: -90, max: 90 }}
                            helperText="Coordonnée latitude"
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Longitude"
                            value={longitude}
                            onChange={e => setLongitude(e.target.value)}
                            type="number"
                            inputProps={{ step: "0.000001", min: -180, max: 180 }}
                            helperText="Coordonnée longitude"
                            required
                          />
                        </Grid>
                      </Grid>

                      {mapBounds && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          La carte est restreinte à la zone: {selectedZoneObj.name}. 
                          Vous ne pouvez pas sélectionner d'emplacement en dehors de cette zone.
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Local Data */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', backgroundColor: '#f1f8e9', border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Sensors sx={{ mr: 1 }} /> Local Sensor Data
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Temperature (°C)" 
                        value={temperatureLocal} 
                        onChange={e => setTemperatureLocal(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField 
                        fullWidth 
                        label="Humidity (%)" 
                        value={humidity} 
                        onChange={e => setHumidity(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Smoke Level</InputLabel>
                        <Select
                          value={smoke}
                          label="Smoke Level"
                          onChange={e => setSmoke(e.target.value)}
                        >
                          {smokeOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Flame Detection</InputLabel>
                        <Select
                          value={flame}
                          label="Flame Detection"
                          onChange={e => setFlame(e.target.value)}
                        >
                          {flameOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Door Status</InputLabel>
                        <Select
                          value={door}
                          label="Door Status"
                          onChange={e => setDoor(e.target.value)}
                        >
                          {doorOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Transformer Data */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', backgroundColor: '#f1f8e9', border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Transform sx={{ mr: 1 }} /> Transformer Data
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Temperature (°C)" 
                        value={temperatureTransfo} 
                        onChange={e => setTemperatureTransfo(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Buchholz 1" 
                        value={buchholz1} 
                        onChange={e => setBuchholz1(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Buchholz 2" 
                        value={buchholz2} 
                        onChange={e => setBuchholz2(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        fullWidth 
                        label="Threshold 1" 
                        value={seuil1} 
                        onChange={e => setSeuil1(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        fullWidth 
                        label="Threshold 2" 
                        value={seuil2} 
                        onChange={e => setSeuil2(e.target.value)}
                        type="number"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Electrical Data */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <ElectricBolt sx={{ mr: 1 }} /> Electrical Parameters (with Tolerance)
                  </Typography>
                  {['L1', 'L2', 'L3'].map((line, idx) => (
                    <Box key={line} sx={{ mb: 3, p: 2, backgroundColor: '#f1f8e9', borderRadius: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#2e7d32', mb: 2 }}>
                        Line {line}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderElectricalField(
                            'Voltage', 
                            idx === 0 ? voltageL1 : idx === 1 ? voltageL2 : voltageL3, 
                            idx === 0 ? setVoltageL1 : idx === 1 ? setVoltageL2 : idx === 2 ? setVoltageL3 : null, 
                            'V',
                            line
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderElectricalField(
                            'Current', 
                            idx === 0 ? currentL1 : idx === 1 ? currentL2 : currentL3, 
                            idx === 0 ? setCurrentL1 : idx === 1 ? setCurrentL2 : idx === 2 ? setCurrentL3 : null, 
                            'A',
                            line
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderElectricalField(
                            'Power', 
                            idx === 0 ? powerL1 : idx === 1 ? powerL2 : powerL3, 
                            idx === 0 ? setPowerL1 : idx === 1 ? setPowerL2 : idx === 2 ? setPowerL3 : null, 
                            'kW',
                            line
                          )}
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          {renderElectricalField(
                            'Power Factor', 
                            idx === 0 ? pfL1 : idx === 1 ? pfL2 : pfL3, 
                            idx === 0 ? setPfL1 : idx === 1 ? setPfL2 : idx === 2 ? setPfL3 : null, 
                            '',
                            line
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={!selectedZone || !latitude || !longitude || submitting}
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  backgroundColor: '#2e7d32',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#1b5e20',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc'
                  }
                }}
              >
                {submitting ? 'Adding Post...' : 'Add New Post'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Zone Details Dialog */}
      <Dialog open={zoneDialogOpen} onClose={() => setZoneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#2e7d32', display: 'flex', alignItems: 'center', backgroundColor: '#e8f5e9' }}>
          <LocationOn sx={{ mr: 1 }} /> Zone Information
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {zoneDetails ? (
            <List>
              <ListItem>
                <ListItemText 
                  primary="Zone Name" 
                  secondary={zoneDetails.name || "Not specified"} 
                  secondaryTypographyProps={{ sx: { color: '#2e7d32', fontWeight: 'medium' } }}
                />
              </ListItem>
              <Divider />
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <People sx={{ mr: 2, color: '#2e7d32', mt: 0.5 }} />
                <ListItemText 
                  primary="Capital" 
                  secondary={zoneDetails.capital || "Not specified"} 
                />
              </ListItem>
              <Divider />
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Map sx={{ mr: 2, color: '#2e7d32', mt: 0.5 }} />
                <ListItemText 
                  primary="Area" 
                  secondary={zoneDetails.area ? `${zoneDetails.area} km²` : "Not specified"} 
                />
              </ListItem>
              <Divider />
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <People sx={{ mr: 2, color: '#2e7d32', mt: 0.5 }} />
                <ListItemText 
                  primary="Population" 
                  secondary={zoneDetails.population || "Not specified"} 
                />
              </ListItem>
              <Divider />
              <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Description sx={{ mr: 2, color: '#2e7d32', mt: 0.5 }} />
                <ListItemText 
                  primary="Description" 
                  secondary={zoneDetails.description ||  "No description available"} 
                />
              </ListItem>
              {zoneDetails.bounds && (
                <>
                  <Divider />
                  <ListItem sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <MyLocation sx={{ mr: 2, color: '#2e7d32', mt: 0.5 }} />
                    <ListItemText 
                      primary="Geographical Limits" 
                      secondary={`Nord: ${zoneDetails.bounds.north}, Sud: ${zoneDetails.bounds.south}, Est: ${zoneDetails.bounds.east}, Ouest: ${zoneDetails.bounds.west}`} 
                    />
                  </ListItem>
                </>
              )}
            </List>
          ) : (
            <Typography>Loading zone information...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f8f9fa' }}>
          <Button 
            onClick={() => setZoneDialogOpen(false)} 
            sx={{ color: '#2e7d32', fontWeight: 'medium' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>        
    </Box>
  );
};

export default AddPost;