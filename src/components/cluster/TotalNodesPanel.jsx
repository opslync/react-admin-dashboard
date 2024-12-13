import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';

export const TotalNodesPanel = ({ totalNodes }) => (
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
            <StorageIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
            <Typography color="text.secondary" variant="body2">
                Total Nodes
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                {totalNodes || 0}
            </Typography>
        </Box>
    </Paper>
);