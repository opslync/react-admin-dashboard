import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, postMethod } from '../library/api';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    Button,
    Box,
    Modal,
    CircularProgress,
    TextField
} from '@mui/material';

const AppConfigurationPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [deployments, setDeployments] = useState([]);
    const [statusMap, setStatusMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(5); // Default to "App Configuration"

    // State for ConfigMap modal
    const [isConfigMapModalOpen, setIsConfigMapModalOpen] = useState(false);
    const [configMapData, setConfigMapData] = useState('');
    const [configMapErrorMessage, setConfigMapErrorMessage] = useState('');

    // State for Secrets modal
    const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
    const [secretData, setSecretData] = useState('');
    const [secretErrorMessage, setSecretErrorMessage] = useState('');

    useEffect(() => {
        const fetchDeploymentHistory = async () => {
            try {
                const response = await getMethod(`app/${appId}/deployments`);
                setDeployments(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch deployment history. Please try again.');
                setLoading(false);
            }
        };

        fetchDeploymentHistory();
    }, [appId]);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const statusPromises = deployments.map(async (deployment) => {
                    const response = await getMethod(`pod/status?appName=${deployment.releaseName}`);
                    return { releaseName: deployment.releaseName, status: response.data[0].status };
                });
                const statusResults = await Promise.all(statusPromises);
                const statusMap = statusResults.reduce((map, { releaseName, status }) => {
                    map[releaseName] = status;
                    return map;
                }, {});
                setStatusMap(statusMap);
            } catch (err) {
                console.error('Failed to fetch pod status:', err);
            }
        };

        if (deployments.length) {
            fetchStatus();
            const intervalId = setInterval(fetchStatus, 300000); // Fetch status every 5 minutes
            return () => clearInterval(intervalId); // Cleanup interval on component unmount
        }
    }, [deployments]);

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

    const handleOpenConfigMapModal = () => {
        setIsConfigMapModalOpen(true);
    };

    const handleCloseConfigMapModal = () => {
        setIsConfigMapModalOpen(false);
    };

    const handleConfigMapSubmit = async () => {
        const keyValues = configMapData.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        try {
            const response = await postMethod(`app/${appId}/configmaps`, keyValues);
            console.log('ConfigMap saved:', response);
            handleCloseConfigMapModal();
        } catch (error) {
            setConfigMapErrorMessage('Failed to save ConfigMap. Please try again.');
            console.error('Failed to save ConfigMap:', error);
        }
    };

    const handleOpenSecretModal = () => {
        setIsSecretModalOpen(true);
    };

    const handleCloseSecretModal = () => {
        setIsSecretModalOpen(false);
    };

    const handleSecretSubmit = async () => {
        const keyValues = secretData.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        try {
            const response = await postMethod(`app/${appId}/secrets`, keyValues);
            console.log('Secret saved:', response);
            handleCloseSecretModal();
        } catch (error) {
            setSecretErrorMessage('Failed to save Secret. Please try again.');
            console.error('Failed to save Secret:', error);
        }
    };

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
            <Typography variant="h4" className="mb-6">App Configuration</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>ConfigMaps</Typography>
                            <Button variant="contained" color="primary" onClick={handleOpenConfigMapModal}>
                                Add ConfigMap
                            </Button>
                            <Modal open={isConfigMapModalOpen} onClose={handleCloseConfigMapModal}>
                                <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
                                    <Typography variant="h6" className="mb-4">Add from your .env file</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        value={configMapData}
                                        onChange={(e) => setConfigMapData(e.target.value)}
                                    />
                                    {configMapErrorMessage && <Typography color="error">{configMapErrorMessage}</Typography>}
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <Button variant="contained" color="primary" onClick={handleCloseConfigMapModal}>
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={handleConfigMapSubmit}>
                                            Save
                                        </Button>
                                    </div>
                                </Box>
                            </Modal>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Secrets</Typography>
                            <Button variant="contained" color="primary" onClick={handleOpenSecretModal}>
                                Add Secret
                            </Button>
                            <Modal open={isSecretModalOpen} onClose={handleCloseSecretModal}>
                                <Box className="absolute top-1/4 left-1/4 w-1/2 bg-white p-4 rounded shadow-lg">
                                    <Typography variant="h6" className="mb-4">Add from your .env file</Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        value={secretData}
                                        onChange={(e) => setSecretData(e.target.value)}
                                    />
                                    {secretErrorMessage && <Typography color="error">{secretErrorMessage}</Typography>}
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <Button variant="contained" color="primary" onClick={handleCloseSecretModal}>
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={handleSecretSubmit}>
                                            Save
                                        </Button>
                                    </div>
                                </Box>
                            </Modal>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default AppConfigurationPage;
