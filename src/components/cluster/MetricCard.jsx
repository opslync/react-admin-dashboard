import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

export const MetricCard = ({ icon: Icon, title, value, unit }) => (
  <Paper 
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderRadius: 2
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.04)'
      }}
    >
      {Icon && <Icon sx={{ fontSize: 24 }} />}
    </Box>
    <Box>
      <Typography color="text.secondary" variant="body2">
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mt: 1 }}>
        {value}
        {unit && (
          <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
            {unit}
          </Typography>
        )}
      </Typography>
    </Box>
  </Paper>
);