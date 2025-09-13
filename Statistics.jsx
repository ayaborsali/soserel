import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  CircularProgress,
  Box,
  Grid,
  Card,
  CardContent,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Lightbulb as LightbulbIcon,
  Power as PowerIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  DonutLarge as DonutIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { collection, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../../firebase';

// Couleurs pour status
const STATUS_COLORS = { active: '#4CAF50', inactive: '#9E9E9E', faulty: '#F44336' };
// Couleurs pour device types
const DEVICE_COLORS = { lamp: '#2196F3', transformateur: '#FF9800', concentrateur: '#9C27B0' };

const Statistics = () => {
  const [deviceStats, setDeviceStats] = useState({});
  const [infrastructureStats, setInfrastructureStats] = useState({ lignes: {}, postes: {}, zones: {} });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'devices'));
        const types = ['lamp', 'transformateur', 'concentrateur'];
        const statsByType = {};
        const lignes = {};
        const postes = {};
        const zones = {};

        types.forEach(type => statsByType[type] = { total: 0, active: 0, inactive: 0, faulty: 0 });

        snapshot.forEach(doc => {
          const data = doc.data();
          const type = data.deviceType?.toLowerCase();
          const status = data.status?.toLowerCase();
          const ligne = data.line || 'Inconnue';
          const poste = data.poste || 'Inconnu';
          const zone = data.zone || 'Inconnue';

          if (types.includes(type)) {
            statsByType[type].total += 1;
            if (status === 'active') statsByType[type].active += 1;
            else if (status === 'inactive') statsByType[type].inactive += 1;
            else if (status === 'faulty') statsByType[type].faulty += 1;
          }

          lignes[ligne] = (lignes[ligne] || 0) + 1;
          postes[poste] = (postes[poste] || 0) + 1;
          zones[zone] = (zones[zone] || 0) + 1;
        });

        setDeviceStats(statsByType);
        setInfrastructureStats({ lignes, postes, zones });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, index }) => (
    <Slide in={!loading} direction="up" timeout={(index + 1) * 200}>
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: color, fontSize: 40 }}>
            {icon}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </CardContent>
      </Card>
    </Slide>
  );

  const renderPieChart = (data) => (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 60 : 80}
          innerRadius={isMobile ? 30 : 50}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, idx) => (
            <Cell key={idx} fill={STATUS_COLORS[entry.name.toLowerCase()]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}`, name]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = (data, dataKeys, colors) => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, idx) => (
          <Bar key={key} dataKey={key} fill={colors[idx]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const aggregatePieData = () => {
    const totals = { active: 0, inactive: 0, faulty: 0 };
    Object.values(deviceStats).forEach(stat => {
      totals.active += stat.active;
      totals.inactive += stat.inactive;
      totals.faulty += stat.faulty;
    });
    return [
      { name: 'Active', value: totals.active },
      { name: 'Inactive', value: totals.inactive },
      { name: 'Faulty', value: totals.faulty },
    ];
  };

  return (
    <Fade in={true} timeout={800}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main', fontSize: 36 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Dashboard Statistiques</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Cards total devices */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
              {Object.entries(deviceStats).map(([type, stats], index) => (
                <Grid item xs={12} sm={4} key={type}>
                  <StatCard
                    title={`${type.charAt(0).toUpperCase() + type.slice(1)} Total`}
                    value={stats.total}
                    icon={<LightbulbIcon />}
                    color={DEVICE_COLORS[type]}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pie Chart global */}
            <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DonutIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Statut global des devices</Typography>
                </Box>
                {renderPieChart(aggregatePieData())}
              </CardContent>
            </Card>

            {/* Bar Charts par type */}
            {Object.entries(deviceStats).map(([type, stats], idx) => {
              const barData = [{ name: type.charAt(0).toUpperCase() + type.slice(1), Active: stats.active, Inactive: stats.inactive, Faulty: stats.faulty }];
              return (
                <Card key={type} sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{type.charAt(0).toUpperCase() + type.slice(1)} - Status Comparison</Typography>
                    </Box>
                    {renderBarChart(barData, ['Active', 'Inactive', 'Faulty'], [STATUS_COLORS.active, STATUS_COLORS.inactive, STATUS_COLORS.faulty])}
                  </CardContent>
                </Card>
              );
            })}

            {/* Infrastructure */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Statistiques Infrastructure</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {['lignes', 'postes', 'zones'].map(key => {
                    const data = Object.entries(infrastructureStats[key]).map(([name, value]) => ({ name, value }));
                    return (
                      <Grid item xs={12} md={4} key={key}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</Typography>
                            {renderBarChart(data, ['value'], ['#2196F3'])}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Paper>
    </Fade>
  );
};

export default Statistics;
