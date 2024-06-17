import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    Typography,
    Grid,
    Card,
    CardContent,
} from '@mui/material';

const AppMetricsPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(4); // Default to "Deployment Metrics"

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            "/app-configuration",
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
            "/app-configuration",
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname], appId);

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="app detail tabs">
                        <Tab label="App Details" />
                        <Tab label="Build & Deploy" />
                        <Tab label="Build History" />
                        <Tab label="Deployment History" />
                        <Tab label="Metrics" />
                        <Tab label="App Configuration" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Typography variant="h4" className="mb-6">Metrics</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Metrics Dashboard</Typography>
                            <div className="relative" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                    src="http://localhost:4000/public-dashboards/3f4c36289dc64432ab642649a5e3b4c2"
                                    className="absolute top-0 left-0 w-full h-full border-0"
                                    title="Grafana Public Dashboard"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default AppMetricsPage;
