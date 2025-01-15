import React from 'react';
import { Grid } from '@mui/material';
import { MetricCard } from './MetricCard';
import { TotalNodesPanel } from './TotalNodesPanel';
import {
    Memory as MemoryIcon,
    Storage as StorageIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';

export const ClusterMetrics = ({ metrics }) => {
    if (!metrics) return null;

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
                <TotalNodesPanel totalNodes={metrics.total_nodes} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={SpeedIcon}
                    title="Total CPU"
                    value={metrics.total_cpu}
                    unit="cores"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={MemoryIcon}
                    title="Total Memory"
                    value={metrics.total_memory}
                    unit=""
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                    icon={StorageIcon}
                    title="Total Storage"
                    value={metrics.total_storage}
                    unit=""
                />
            </Grid>
        </Grid>
    );
};