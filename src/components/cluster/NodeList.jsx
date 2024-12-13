import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { formatUptime, formatCPU } from '../../utils/formatters';

const NodeItem = ({ node }) => (
    <Paper
        sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{node.name}</Typography>
            <Chip
                label="healthy"
                color="success"
                size="small"
                sx={{ borderRadius: 1 }}
            />
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
                <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                <Typography>{formatCPU(node.cpu_usage)} cores</Typography>
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Uptime</Typography>
                <Typography>{formatUptime(node.uptime)}</Typography>
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">Pods</Typography>
                <Typography>{node.pod_count}</Typography>
            </Box>
        </Box>
    </Paper>
);

export const NodeList = ({ nodes }) => (
    <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>Cluster Nodes</Typography>
        {nodes?.map((node, index) => (
            <NodeItem key={node.name || index} node={node} />
        ))}
    </Box>
);