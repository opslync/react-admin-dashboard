import React from 'react';
import { Card, Typography, Box, Chip } from '@mui/material';
import { formatUptime } from '../../utils/formatters';

export const NodeStatus = ({ node }) => (
    <Card sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{node.name}</Typography>
            <Chip
                label="Active"
                color="success"
                size="small"
                sx={{ borderRadius: '4px' }}
            />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2">
                Uptime: {formatUptime(node.uptime)}
            </Typography>
            <Typography variant="body2">
                Pods: {node.pod_count}
            </Typography>
        </Box>
    </Card>
);