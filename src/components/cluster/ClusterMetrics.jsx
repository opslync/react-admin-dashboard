import React from 'react';
import { Grid } from '@mui/material';
import { MetricCard } from './MetricCard';
import { TotalNodesPanel } from './TotalNodesPanel';
import {
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { formatCPU, formatMemory } from '../../utils/formatters';

export const ClusterMetrics = ({ metrics }) => {
    if (!metrics) return null;

    const node = metrics.nodes[0];

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
                <TotalNodesPanel totalNodes={metrics.total_nodes} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={SpeedIcon}
                    title="CPU Usage"
                    value={formatCPU(node.cpu_usage)}
                    unit="cores"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={MemoryIcon}
                    title="Memory Usage"
                    value={formatMemory(node.memory_usage)}
                    unit="MB"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={StorageIcon}
                    title="Total Storage"
                    value={formatMemory(node.total_storage)}
                    unit="GB"
                />
            </Grid>
        </Grid>
    );
};