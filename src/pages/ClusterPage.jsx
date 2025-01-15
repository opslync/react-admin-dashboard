import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { ClusterHeader } from '../components/cluster/ClusterHeader';
import { ClusterMetrics } from '../components/cluster/ClusterMetrics';
import { ClusterGrid } from '../components/cluster/ClusterGrid';
import { getMethod } from '../library/api';

const ClusterPage = () => {
    const [clusterMetrics, setClusterMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClusterResources = async () => {
            try {
                const response = await getMethod('cluster/resources');
                setClusterMetrics(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch cluster resources:', err);
                setError('Failed to fetch cluster resources. Please try again.');
                setLoading(false);
            }
        };

        fetchClusterResources();
    }, []);

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 3,
                ml: { sm: '240px' },
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

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <ClusterMetrics metrics={clusterMetrics?.total} />
                    <ClusterGrid nodes={clusterMetrics?.nodes} />
                </>
            )}
        </Box>
    );
};

export default ClusterPage;