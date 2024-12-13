import React from 'react';
import { Box, CircularProgress, Grid } from '@mui/material';
import { MetricsCard } from './MetricsCard';
import { NodeStatus } from './NodeStatus';
import {
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
    Hub as HubIcon
} from '@mui/icons-material';
import {
    formatStorage,
    formatCPU,
    formatMemory
} from '../../utils/formatters';

export const ClusterMetrics = ({ clusterMetrics }) => {
    if (!clusterMetrics) {
        return <CircularProgress size={40} />;
    }

    const node = clusterMetrics.nodes[0];

    return (
        <Box sx={{ width: '100%' }}>
            <NodeStatus node={node} />

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                    <MetricsCard
                        title="CPU Usage"
                        value={formatCPU(node.cpu_usage)}
                        unit="cores"
                        icon={SpeedIcon}
                    />
                </Grid>
                <Grid item xs={6}>
                    <MetricsCard
                        title="Memory Usage"
                        value={formatMemory(node.memory_usage)}
                        unit="MB"
                        icon={MemoryIcon}
                    />
                </Grid>
                <Grid item xs={6}>
                    <MetricsCard
                        title="Storage"
                        value={formatStorage(node.total_storage)}
                        unit="GB"
                        icon={StorageIcon}
                    />
                </Grid>
                <Grid item xs={6}>
                    <MetricsCard
                        title="Total Nodes"
                        value={clusterMetrics.total_nodes}
                        unit="nodes"
                        icon={HubIcon}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};