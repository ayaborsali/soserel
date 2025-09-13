import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Paper, TextField, Grid, Divider, Chip, Button,
  IconButton, Menu, MenuItem, FormControl, InputLabel, Select, Tabs, Tab
} from '@mui/material';
import {
  FilterList, Search, Dashboard as DashboardIcon, Refresh, LocationOn,
  TrendingUp, ShowChart, DonutLarge, Map, ElectricBolt
} from '@mui/icons-material';
import {
  MapContainer, TileLayer, Marker, Popup
} from 'react-leaflet';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, AreaChart, Area
} from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom icons
const iconMap = {
  lamp: new L.Icon({
    iconUrl: '/icons/lamp.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  transformer: new L.Icon({
    iconUrl: '/icons/transformer.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  switch: new L.Icon({
    iconUrl: '/icons/switch.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  sensor: new L.Icon({
    iconUrl: '/icons/sensor.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  poste: new L.Icon({
    iconUrl: '/icons/poste.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  default: new L.Icon({
    iconUrl: '/icons/default.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  })
};

// Colors for charts
const COLORS = ['#0078D4', '#16BBD2', '#55C5DA', '#88D9E6', '#BFEAF5'];
const STATUS_COLORS = {
  active: '#4CAF50',
  inactive: '#9E9E9E',
  fault: '#F44336',
  unknown: '#FF9800'
};

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [lines, setLines] = useState([]);
  const [postes, setPostes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch devices from 'devices' collection
      const devicesQuery = query(collection(db, 'devices'), orderBy('addedAt', 'desc'));
      const devicesSnapshot = await getDocs(devicesQuery);
      const loadedDevices = devicesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Extract location data
        let latitude = null, longitude = null;
        if (data.location) {
          latitude = data.location.lat || null;
          longitude = data.location.lng || null;
        }
        
        // Parse electrical data if available
        let powerConsumption = 0;
        let current = 0;
        let voltage = 0;
        let powerFactor = 0;
        
        if (data.electricalData) {
          if (data.electricalData.power && data.electricalData.power.value) {
            powerConsumption = parseFloat(data.electricalData.power.value) || 0;
          }
          if (data.electricalData.current && data.electricalData.current.value) {
            current = parseFloat(data.electricalData.current.value) || 0;
          }
          if (data.electricalData.voltage && data.electricalData.voltage.value) {
            voltage = parseFloat(data.electricalData.voltage.value) || 0;
          }
          if (data.electricalData.powerFactor && data.electricalData.powerFactor.value) {
            powerFactor = parseFloat(data.electricalData.powerFactor.value) || 0;
          }
        }

        // Determine device type based on available data
        let type = 'unknown';
        if (data.lampId) type = 'lamp';
        else if (data.transformerData) type = 'transformer';
        else if (data.electricalData) type = 'sensor';

        return {
          id: doc.id,
          name: data.name || data.lampId || data.postId || 'Unknown device',
          status: data.status || data.lampState || 'unknown',
          type: type,
          latitude,
          longitude,
          lastUpdate: data.addedAt || new Date(),
          powerConsumption,
          current,
          voltage,
          powerFactor,
          lineId: data.lineId || '',
          postId: data.postId || '',
          zoneId: data.zoneId || '',
          lampState: data.lampState || '',
          lightLevel: data.lightLevel || 0
        };
      });

      setDevices(loadedDevices);

      // Fetch lines data from 'lines' collection
      const linesQuery = query(collection(db, 'lines'), orderBy('name', 'asc'));
      const linesSnapshot = await getDocs(linesQuery);
      const loadedLines = linesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown line',
          status: data.status || 'unknown',
          current: parseFloat(data.current) || 0,
          voltage: parseFloat(data.voltage) || 0,
          currentTolerance: parseFloat(data.currentTolerance) || 0,
          voltageTolerance: parseFloat(data.voltageTolerance) || 0,
          substitutionId: data.substitutionId || ''
        };
      });
      setLines(loadedLines);

      // Fetch postes data from 'postes' collection
      const postesQuery = query(collection(db, 'postes'), orderBy('name', 'asc'));
      const postesSnapshot = await getDocs(postesQuery);
      const loadedPostes = postesSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Parse electrical data if available
        let powerConsumption = 0;
        let current = 0;
        let voltage = 0;
        let powerFactor = 0;
        
        if (data.electricalData) {
          if (data.electricalData.power && data.electricalData.power.value) {
            powerConsumption = parseFloat(data.electricalData.power.value) || 0;
          }
          if (data.electricalData.current && data.electricalData.current.value) {
            current = parseFloat(data.electricalData.current.value) || 0;
          }
          if (data.electricalData.voltage && data.electricalData.voltage.value) {
            voltage = parseFloat(data.electricalData.voltage.value) || 0;
          }
          if (data.electricalData.powerFactor && data.electricalData.powerFactor.value) {
            powerFactor = parseFloat(data.electricalData.powerFactor.value) || 0;
          }
        }

        // Parse transformer data if available
        let transformerTemp = 0;
        let buchholz1 = 0;
        let buchholz2 = 0;
        
        if (data.transformerData) {
          transformerTemp = parseFloat(data.transformerData.temperature) || 0;
          buchholz1 = parseFloat(data.transformerData.buchholz1) || 0;
          buchholz2 = parseFloat(data.transformerData.buchholz2) || 0;
        }

        // Parse location data
        let latitude = null, longitude = null;
        if (data.position) {
          latitude = data.position.latitude || null;
          longitude = data.position.longitude || null;
        }

        return {
          id: doc.id,
          name: data.name || 'Unknown poste',
          status: data.status || 'unknown',
          latitude,
          longitude,
          token: data.token || '',
          zoneId: data.zoneId || '',
          zoneName: data.zoneName || '',
          powerConsumption,
          current,
          voltage,
          powerFactor,
          transformerTemp,
          buchholz1,
          buchholz2
        };
      });
      setPostes(loadedPostes);

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || device.status === selectedStatus;
    const matchType = selectedType === 'All' || device.type === selectedType;
    return matchSearch && matchStatus && matchType;
  });

  // Prepare data for charts
  const statusData = Object.entries(
    filteredDevices.reduce((acc, device) => {
      const status = device.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: status, value: count, color: STATUS_COLORS[status] || '#0078D4' }));

  const typeData = Object.entries(
    filteredDevices.reduce((acc, device) => {
      const type = device.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ name: type, value: count }));

  // Calculate metrics
  const totalDevices = filteredDevices.length;
  const activeDevices = filteredDevices.filter(d => d.status === 'active' || d.status === '1').length;
  const faultDevices = filteredDevices.filter(d => d.status === 'fault' || d.status === '0').length;
  const totalPowerConsumption = filteredDevices.reduce((sum, device) => 
    sum + (device.powerConsumption || 0), 0
  );

  // Calculate lines metrics
  const totalLines = lines.length;
  const operationalLines = lines.filter(line => line.status === 'active').length;
  const maintenanceLines = lines.filter(line => line.status === 'maintenance').length;

  // Calculate postes metrics
  const totalPostes = postes.length;
  const operationalPostes = postes.filter(poste => poste.status === 'active').length;
  const totalPostesPower = postes.reduce((sum, poste) => sum + (poste.powerConsumption || 0), 0);

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ElectricBolt sx={{ mr: 2, color: '#1b5e20', fontSize: 32 }} />
          <Typography variant="h4" fontWeight="700" color="#1a202c">
            Energy Management Dashboard
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={fetchData} disabled={loading} sx={{ color: '#4caf50' }}>
            <Refresh />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{ ml: 1, borderColor: '#cbd5e0', color: '#4a5568' }}
          >
            Filters
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="7d">Last 7 days</MenuItem>
                  <MenuItem value="30d">Last 30 days</MenuItem>
                  <MenuItem value="90d">Last 90 days</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Divider sx={{ mb: 4 }} />

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Devices Overview" icon={<DonutLarge />} />
        <Tab label="Power Lines" icon={<ShowChart />} />
        <Tab label="Postes" icon={<LocationOn />} />
        <Tab label="Energy Analytics" icon={<TrendingUp />} />
      </Tabs>

      {/* Search and filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search for a device..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
          }}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['All', 'active', 'inactive', 'fault'].map((status) => (
            <Chip
              key={status}
              label={status}
              clickable
              variant={selectedStatus === status ? 'filled' : 'outlined'}
              color={selectedStatus === status ? 'primary' : 'default'}
              onClick={() => setSelectedStatus(status)}
              size="small"
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="All">All types</MenuItem>
            <MenuItem value="lamp">Lamp</MenuItem>
            <MenuItem value="transformer">Transformer</MenuItem>
            <MenuItem value="switch">Switch</MenuItem>
            <MenuItem value="sensor">Sensor</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h2" fontWeight="700">{totalDevices}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Devices</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h2" fontWeight="700">{activeDevices}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Devices</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #f44336 0%, #ff9800 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h2" fontWeight="700">{faultDevices}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Faulty Devices</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
            color: 'white',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h2" fontWeight="700">{totalPowerConsumption.toFixed(2)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Power Consumption (W)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Power Lines Metrics */}
      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#1b5e20">{totalLines}</Typography>
              <Typography variant="body2" color="text.secondary">Total Power Lines</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#4caf50">{operationalLines}</Typography>
              <Typography variant="body2" color="text.secondary">Operational Lines</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#ff9800">{maintenanceLines}</Typography>
              <Typography variant="body2" color="text.secondary">Under Maintenance</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Postes Metrics */}
      {activeTab === 2 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#1b5e20">{totalPostes}</Typography>
              <Typography variant="body2" color="text.secondary">Total Postes</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#4caf50">{operationalPostes}</Typography>
              <Typography variant="body2" color="text.secondary">Operational Postes</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, p: 3 }}>
              <Typography variant="h4" fontWeight="700" color="#2196f3">{totalPostesPower.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Total Power (W)</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Visualizations */}
      <Grid container spacing={3}>
        {/* Status Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '350px', boxShadow: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="#1a202c" fontWeight="600">
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#718096" />
                <YAxis allowDecimals={false} stroke="#718096" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Type Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '350px', boxShadow: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="#1a202c" fontWeight="600">
              Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 3, height: '400px', boxShadow: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="#1a202c" fontWeight="600">
              Device Locations
              <IconButton size="small" sx={{ ml: 1 }}>
                <Map fontSize="small" />
              </IconButton>
            </Typography>
            {filteredDevices.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
                No devices found.
              </Typography>
            ) : (
              <MapContainer 
                center={[36.818, 10.165]} 
                zoom={12} 
                style={{ height: '300px', width: '100%', borderRadius: '12px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {filteredDevices
                  .filter(device => typeof device.latitude === 'number' && typeof device.longitude === 'number')
                  .map(device => {
                    const icon = iconMap[device.type] || iconMap.default;

                    return (
                      <Marker
                        key={device.id}
                        position={[device.latitude, device.longitude]}
                        icon={icon}
                      >
                        <Popup>
                          <strong>{device.name}</strong><br />
                          Type: {device.type || 'N/A'}<br />
                          Status: {device.status}<br />
                          {device.powerConsumption > 0 && `Power: ${device.powerConsumption} W<br />`}
                          {device.lightLevel > 0 && `Light Level: ${device.lightLevel}<br />`}
                          📍 {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                        </Popup>
                      </Marker>
                    );
                  })}
                  
                {/* Add postes to the map */}
                {postes
                  .filter(poste => typeof poste.latitude === 'number' && typeof poste.longitude === 'number')
                  .map(poste => (
                    <Marker
                      key={poste.id}
                      position={[poste.latitude, poste.longitude]}
                      icon={iconMap.poste}
                    >
                      <Popup>
                        <strong>{poste.name}</strong><br />
                        Type: Poste<br />
                        Status: {poste.status}<br />
                        {poste.powerConsumption > 0 && `Power: ${poste.powerConsumption} W<br />`}
                        {poste.transformerTemp > 0 && `Temp: ${poste.transformerTemp}°C<br />`}
                        📍 {poste.latitude.toFixed(6)}, {poste.longitude.toFixed(6)}
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;