import React from 'react';
import PropTypes from 'prop-types';
import { Paper, useTheme, useMediaQuery } from '@mui/material';

const MapSection = ({ location = 'Tunis', zoom = 13 }) => {
  const theme = useTheme();

  // Adjust height based on screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const height = isSmallScreen ? 200 : 400;

  // Encode URL to support location with special characters
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    location
  )}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Paper
      elevation={4}
      sx={{
        flex: 1,
        height,
        m: 2,
        borderRadius: 3,
        boxShadow: 3,
        overflow: 'hidden',
      }}
    >
      <iframe
        title={`Map of ${location}`}
        width="100%"
        height="100%"
        src={mapSrc}
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Paper>
  );
};

// Prop types validation
MapSection.propTypes = {
  location: PropTypes.string,
  zoom: PropTypes.number,
};

export default MapSection;
