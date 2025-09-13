import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';

const DetailsPanel = ({
  message = 'xxxx',
  lampStatus = 'OFF',
  tune = 'xxxx',
  wattage = '110W',
  mode = 'Mode...',
  burningHours = 35.0,
  poleAddress = 'Lane 1',
  imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Street_light_lamp.jpg/320px-Street_light_lamp.jpg'
}) => {
  return (
    <Paper
      sx={{
        width: 320,
        m: 1,
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: 'background.paper',
      }}
      elevation={6}
    >
      <Typography variant="h6" mb={2} fontWeight="bold" textAlign="center">
        Details Panel
      </Typography>

      <Box mb={2}>
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Message Received:
        </Typography>
        <Typography variant="body1" mb={1}>
          {message}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Lamp Status:
        </Typography>
        <Typography variant="body1" mb={1} color={lampStatus === 'ON' ? 'success.main' : 'error.main'}>
          {lampStatus}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          ON/OFF Tune:
        </Typography>
        <Typography variant="body1" mb={1}>
          {tune}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Wattage:
        </Typography>
        <Typography variant="body1" mb={1}>
          {wattage}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Mode of Operation:
        </Typography>
        <Typography variant="body1" mb={1}>
          {mode}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Burning Hours:
        </Typography>
        <Typography variant="body1" mb={1}>
          {burningHours.toFixed(2)}
        </Typography>

        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Pole Address:
        </Typography>
        <Typography variant="body1">
          {poleAddress}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box
        component="img"
        src={imageUrl}
        alt="Lamp"
        sx={{ width: '100%', borderRadius: 2, maxHeight: 180, objectFit: 'cover' }}
      />
    </Paper>
  );
};

export default DetailsPanel;
