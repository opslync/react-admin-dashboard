import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, postMethod, putMethod } from '../library/api';
import { AppBar, Tabs, Tab, Typography, Button, Box, Toolbar, CircularProgress, MenuItem, Select, FormControl, InputLabel, Card, CardContent } from '@mui/material';

const BuildDeployPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    const [updatedRepoUrl, setUpdatedRepoUrl] = useState('');
    const [logs, setLogs] = useState([]);
    const [buildId, setBuildId] = useState(null);
    const [showLogs, setShowLogs] = useState(false); // State to manage log visibility
    const [tabValue, setTabValue] = useState(0);
    const [isDeploying, setIsDeploying] = useState(false); // State for deploy spinner
    const [branches, setBranches] = useState([]); // State to store branches
    const [selectedBranch, setSelectedBranch] = useState(''); // State to store the selected branch
    const ws = useRef(null);

    useEffect(() => {
        // Fetch app details
        const fetchAppDetails = async () => {
            try {
                const response = await getMethod(`app/${appId}`);
                setApp(response.data);
                setUpdatedName(response.data.name);
                setUpdatedRepoUrl(response.data.repoUrl);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch app details. Please try again.');
                setLoading(false);
            }
        };

        fetchAppDetails();
    }, [appId]);

    useEffect(() => {
        // Fetch branches
        const fetchBranches = async () => {
            try {
                const repoName = app.repoUrl.split('/').slice(-1)[0].replace('.git', '');
                const response = await getMethod(`app/github/branch?repoName=${repoName}`);
                setBranches(response.data);
                setSelectedBranch(response.data[0]); // Set the first branch as the default
            } catch (err) {
                setError('Failed to fetch branches. Please try again.');
            }
        };

        if (app) {
            fetchBranches();
        }
    }, [app]);

    useEffect(() => {
        if (buildId) {
            ws.current = new WebSocket(`ws://localhost:8080/api/app/ws/${buildId}`);

            ws.current.onopen = () => {
                console.log('WebSocket connection opened');
            };

            ws.current.onmessage = (event) => {
                setLogs((prevLogs) => [...prevLogs, event.data]);
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.current.onclose = () => {
                console.log('WebSocket connection closed');
            };

            return () => {
                if (ws.current) {
                    ws.current.close();
                }
            };
        }
    }, [buildId]);

    const handleBuild = async () => {
        try {
            console.log('Building app...');
            setLogs([]); // Clear previous logs before starting a new build
            setShowLogs(true); // Show logs panel when a new build starts
            const response = await postMethod(`app/${appId}/build`, { repoUrl: app.repoUrl, branch: selectedBranch });
            setBuildId(response.data.buildId);
            console.log('Build response:', response.data);
        } catch (error) {
            console.error('Failed to build app:', error);
            setError('Failed to build app. Please try again.');
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            console.log('Deploying app...');
            const deployData = {
                releaseName: app.name,
                releaseNamespace: "default",
                chartPath: "./chart/opslync-chart-0.1.0.tgz",
                values: {
                    fullnameOverride: app.name,
                    tag: "latest"
                }
            };
            const response = await postMethod(`app/${appId}/deploy`, deployData);
            if (response.status === 200) {
                console.log('Deploy response:', response.data);
                // Handle success, show notification, etc.
            }
        } catch (error) {
            console.error('Failed to deploy app:', error);
            setError('Failed to deploy app. Please try again.');
        } finally {
            setIsDeploying(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await putMethod(`app/${appId}`, {
                name: updatedName,
                repoUrl: updatedRepoUrl
            });
            setApp(response.data);
            setIsEditing(false);
            console.log('App updated:', response.data);
        } catch (error) {
            console.error('Failed to update app:', error);
            setError('Failed to update app. Please try again.');
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleBack = () => {
        history.goBack();
    };

    const toggleLogs = () => {
        setShowLogs(!showLogs);
    };

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

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen bg-gray-100">
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
            {app && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="bg-white p-6 rounded-lg shadow-md">
                        <CardContent>
                            <Typography variant="h5" className="mb-4">Build App</Typography>
                            <p className="mb-4 text-gray-700">{app.description}</p>
                            <p className="mb-4 text-gray-700">{app.repoUrl}</p>
                            <FormControl variant="outlined" className="mb-4" style={{ minWidth: 150 }}>
                                <InputLabel id="branch-select-label" >Branch</InputLabel>
                                <Select
                                    labelId="branch-select-label"
                                    id="branch-select"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                    label="Branch"
                                >
                                    {branches.map((branch, index) => (
                                        <MenuItem key={index} value={branch}>
                                            {branch}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Typography className="mb-1"></Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBuild}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Build
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-white p-6 rounded-lg shadow-md">
                        <CardContent>
                            <Typography variant="h5" className="mb-4">Deploy App</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleDeploy}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                disabled={isDeploying}
                                startIcon={isDeploying && <CircularProgress size={20} />}
                            >
                                {isDeploying ? 'Deploying...' : 'Deploy'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
            {buildId && (
                <div className="mt-6">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={toggleLogs}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
                    >
                        {showLogs ? 'Hide Logs' : 'Show Logs'}
                    </Button>
                    {showLogs && (
                        <div className="bg-black text-white p-4 rounded-lg h-64 overflow-y-scroll">
                            {logs.map((log, index) => (
                                <div key={index} className="whitespace-pre-wrap">{log}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuildDeployPage;
