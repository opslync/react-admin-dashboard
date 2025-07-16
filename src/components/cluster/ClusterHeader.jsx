import React from 'react';
import { Typography, Box } from '@mui/material';

export const ClusterHeader = () => (
    <Box
        sx={{
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
        }}
    >
        <Typography variant="h4" component="h1">
            Cluster Overview
        </Typography>
    </Box>
);