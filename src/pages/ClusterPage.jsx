import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { ClusterHeader } from '../components/cluster/ClusterHeader';
import { ClusterMetrics } from '../components/cluster/ClusterMetrics';
import { NodeList } from '../components/cluster/NodeList';
import { useClusterMetrics } from '../hooks/useClusterMetrics';

const ClusterPage = () => {
    const { clusterMetrics, error } = useClusterMetrics();

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 3,
                ml: { sm: '240px' }, // Adjust this value based on your sidebar width
                width: { sm: `calc(100% - 240px)` },
                backgroundColor: 'background.default',
                minHeight: '100vh'
            }}
        >
            <ClusterHeader />

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {!clusterMetrics && !error ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <ClusterMetrics metrics={clusterMetrics} />
                    <NodeList nodes={clusterMetrics?.nodes} />
                </>
            )}
        </Box>
    );
};

export default ClusterPage;