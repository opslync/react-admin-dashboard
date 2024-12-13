import React from 'react';
import { Card, Typography, Box } from '@mui/material';

export const MetricsCard = ({ title, value, unit, icon: Icon }) => (
    <Card
        sx={{
            padding: '16px',
            backgroundColor: '#1e1e1e',
            color: 'white',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Icon && <Icon sx={{ fontSize: 24 }} />}
            <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {value}
            <Typography component="span" variant="body1" sx={{ ml: 1 }}>
                {unit}
            </Typography>
        </Typography>
    </Card>
);