import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Typography, Grid, CircularProgress, Box } from '@mui/material';
import { AppDetailHeader } from '../components/app-detail/AppDetailHeader';
import { StatusCard } from '../components/app-detail/StatusCard';
import { CommitCard } from '../components/app-detail/CommitCard';
import { PodShellInterface } from '../components/app-detail/PodShellInterface';
import { useAppDeployments } from '../hooks/useAppDeployments';
import { usePodStatus } from '../hooks/usePodStatus';

const AppDetailPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0);
    const { deployments, loading, error } = useAppDeployments(appId);
    const statusMap = usePodStatus(appId, deployments);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            `/app/${appId}/app-configuration`,
        ];
        history.push(paths[newValue]);
    };

    useEffect(() => {
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            `/app/${appId}/app-configuration`,
        ];
        const activeTab = paths.indexOf(location.pathname);
        if (activeTab !== -1) setTabValue(activeTab);
    }, [location.pathname, appId]);

    const statusCounts = deployments.reduce((acc, deployment) => {
        const status = statusMap[deployment.releaseName] || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
    }));

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    ml: { sm: '240px' }
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, ml: { sm: '240px' } }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const latestDeployment = deployments[0];
    const podDetails = latestDeployment ? {
        namespace: 'default',
        podName: latestDeployment.releaseName,
        container: 'main'
    } : null;

    return (
        <Box
            sx={{
                ml: { sm: '240px' },
                transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            }}
        >
            <AppDetailHeader tabValue={tabValue} onTabChange={handleTabChange} />

            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 4 }}>App Details</Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <StatusCard chartData={chartData} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <CommitCard deployment={latestDeployment} />
                    </Grid>
                    <Grid item xs={12}>
                        <PodShellInterface podDetails={podDetails} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AppDetailPage;