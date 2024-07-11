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
    Box,
    CircularProgress,
} from '@mui/material';
import { getMethod } from '../library/api';
import Cookies from 'js-cookie';

const AppMetricsPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(4); // Default to "Deployment Metrics"
    const [podName, setPodName] = useState('default-pod-name'); // Set a default pod name
    const [namespace, setNamespace] = useState('default');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        setTabValue(activeTab);
    }, [location.pathname, appId]);

    useEffect(() => {
        const fetchPodStatus = async () => {
            const savedPodName = Cookies.get(`podName_${appId}`);
            const savedNamespace = Cookies.get(`namespace_${appId}`);

            if (savedPodName && savedNamespace) {
                setPodName(savedPodName);
                setNamespace(savedNamespace);
                setLoading(false);
            } else {
                try {
                    const response = await getMethod(`app/${appId}/pod/status`);
                    if (response.data.length > 0) {
                        const { podName, namespace } = response.data[0];
                        setPodName(podName);
                        setNamespace(namespace);
                        Cookies.set(`podName_${appId}`, podName);
                        Cookies.set(`namespace_${appId}`, namespace);
                    }
                    setLoading(false);
                } catch (err) {
                    setPodName('default-pod-name'); // Set a default pod name in case of error
                    setNamespace('default'); // Set a default namespace in case of error
                    setLoading(false);
                }
            }
        };

        fetchPodStatus();
    }, [appId]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

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
            <Typography variant="h4" className="mb-6">App Metrics</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card className="shadow-lg">
                        <CardContent>
                            <Typography variant="h6" gutterBottom className="text-center">CPU</Typography>
                            <Box className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                    src={`https://grafana.preview.opslync.io/d-solo/6581e46e4e5c7ba40a07646395ef7b23/kubernetes-compute-resources-pod?orgId=1&refresh=10s&var-datasource=prometheus&var-cluster=&var-namespace=${namespace}&var-pod=${podName}&panelId=1`}
                                    className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg"
                                    title="Grafana Public Dashboard 1"
                                    allowFullScreen
                                ></iframe>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card className="shadow-lg">
                        <CardContent>
                            <Typography variant="h6" gutterBottom className="text-center">Memory</Typography>
                            <Box className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                    src={`https://grafana.preview.opslync.io/d-solo/6581e46e4e5c7ba40a07646395ef7b23/kubernetes-compute-resources-pod?orgId=1&refresh=10s&var-datasource=prometheus&var-cluster=&var-namespace=${namespace}&var-pod=${podName}&panelId=4`}
                                    className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg"
                                    title="Grafana Public Dashboard 2"
                                    allowFullScreen
                                ></iframe>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default AppMetricsPage;
