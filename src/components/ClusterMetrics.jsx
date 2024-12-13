import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { MetricsCard } from './MetricsCard';
import { calculateMetrics } from '../utils/metricsCalculator';

export const ClusterMetrics = ({ clusterMetrics }) => {
  if (!clusterMetrics) {
    return <CircularProgress size={40} />;
  }

  const metrics = calculateMetrics(clusterMetrics);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <MetricsCard
        title="CPU Usage"
        value={metrics.cpuUsagePercentage}
        color="#ff7043"
      />
      <MetricsCard
        title="Memory Usage"
        value={metrics.memoryUsagePercentage}
        color="#42a5f5"
      />
      <MetricsCard
        title="Total Storage"
        value={metrics.totalStorageGB}
        color="#66bb6a"
      />
    </Box>
  );
};