import React, { useState } from 'react';
import {
    Typography,
    Card,
    CardContent,
    Box,
    Alert,
} from '@mui/material';
import { useDeployments } from '../hooks/useDeployments';
import { useClusterMetrics } from '../hooks/useClusterMetrics';
import { DeploymentChart } from '../components/DeploymentChart';
import { ClusterMetrics } from '../components/metrics/ClusterMetrics';
import { DeploymentTable } from '../components/DeploymentTable';

const OverviewPage = () => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(8);
    const { deployments, loading: deploymentsLoading, error: deploymentsError } = useDeployments();
    const { clusterMetrics, error: metricsError } = useClusterMetrics();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (deploymentsLoading) return <Typography>Loading...</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-6 bg-gray-100 min-h-screen">
            {(deploymentsError || metricsError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {deploymentsError || metricsError}
                </Alert>
            )}

            <Typography variant="h4" className="mb-6">Cluster Overview</Typography>

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                <Box flex={1}>
                    <ClusterMetrics clusterMetrics={clusterMetrics} />
                </Box>
                <Box flex={1}>
                    <DeploymentChart deployments={deployments} />
                </Box>
            </Box>

            <Card className="mt-6">
                <CardContent>
                    <Typography variant="h5" className="mb-4">Recent Deployments</Typography>
                    <DeploymentTable
                        deployments={deployments}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default OverviewPage;