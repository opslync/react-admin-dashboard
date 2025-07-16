import React from 'react';
import { Card, Typography, Box, CircularProgress } from '@mui/material';

export const MetricsCard = ({ title, value, color }) => (
  <Card style={{ padding: '16px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '8px' }}>
    <Typography variant="h6" align="center">{title}</Typography>
    <Box position="relative" display="inline-flex" justifyContent="center" alignItems="center" margin="16px 0">
      <CircularProgress variant="determinate" value={value} style={{ color, height: '80px', width: '80px' }} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>{value}%</Typography>
      </Box>
    </Box>
  </Card>
);