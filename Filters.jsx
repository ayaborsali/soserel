import React, { useState } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

const Filters = ({ 
  cities = ['Tunis', 'Sfax', 'Sousse'], 
  zones = ['Zone 1', 'Zone 2', 'Zone 3'],
  sectors = ['Sector A', 'Sector B', 'Sector C'],
  lanes = ['Lane 1', 'Lane 2', 'Lane 3'],
  onApply
}) => {
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [sector, setSector] = useState('');
  const [lane, setLane] = useState('');

  const handleApply = () => {
    if (onApply) {
      onApply({ city, zone, sector, lane });
    }
  };

  const handleClear = () => {
    setCity('');
    setZone('');
    setSector('');
    setLane('');
    if (onApply) {
      onApply({ city: '', zone: '', sector: '', lane: '' });
    }
  };

  return (
    <Box display="flex" gap={2} mt={2} flexWrap="wrap">
      <FormControl fullWidth sx={{ minWidth: 120 }}>
        <InputLabel id="filter-city-label">City</InputLabel>
        <Select
          labelId="filter-city-label"
          value={city}
          label="City"
          onChange={(e) => setCity(e.target.value)}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {cities.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: 120 }}>
        <InputLabel id="filter-zone-label">Zone</InputLabel>
        <Select
          labelId="filter-zone-label"
          value={zone}
          label="Zone"
          onChange={(e) => setZone(e.target.value)}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {zones.map((z) => (
            <MenuItem key={z} value={z}>{z}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: 120 }}>
        <InputLabel id="filter-sector-label">Sector</InputLabel>
        <Select
          labelId="filter-sector-label"
          value={sector}
          label="Sector"
          onChange={(e) => setSector(e.target.value)}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {sectors.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ minWidth: 120 }}>
        <InputLabel id="filter-lane-label">Lane</InputLabel>
        <Select
          labelId="filter-lane-label"
          value={lane}
          label="Lane"
          onChange={(e) => setLane(e.target.value)}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {lanes.map((l) => (
            <MenuItem key={l} value={l}>{l}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" alignItems="center" gap={1}>
        <Button 
          variant="contained" 
          onClick={handleApply} 
          disabled={!city && !zone && !sector && !lane}
        >
          Apply
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={handleClear} 
          disabled={!city && !zone && !sector && !lane}
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default Filters;
