import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory, useLocation } from 'react-router-dom';
import { postMethod } from '../library/api';
import { AppBar, Tabs, Tab, Typography, Button, Box, Toolbar, TextField, CircularProgress } from '@mui/material';

const BuildDeployPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [repoUrl, setRepoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [buildLogs, setBuildLogs] = useState('');
    const [deployLogs, setDeployLogs] = useState('');
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(2); // Default to "Build & Deploy"

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            "/overview",
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            "/build-history",
            "/deployment-history",
            "/deployment-metrics",
            "/app-configuration",
        ];
        history.push(paths[newValue]);
    };

    const handleBuild = async () => {
        setIsLoading(true);
        setBuildLogs('');
        setError('');
        try {
            const response = await postMethod(`app/${appId}/build`, { repoUrl });
            setBuildLogs(response.data.logs);
        } catch (error) {
            setError('Failed to build the app. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeploy = async () => {
        setIsLoading(true);
        setDeployLogs('');
        setError('');
        try {
            const response = await postMethod(`app/${appId}/deploy`, { repoUrl });
            setDeployLogs(response.data.logs);
        } catch (error) {
            setError('Failed to deploy the app. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const paths = [
            "/overview",
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            "/build-history",
            "/deployment-history",
            "/deployment-metrics",
            "/app-configuration",
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname, appId]);

    return (
        <div className="flex flex-col lg:ml-64 p-4 relative min-h-screen bg-gray-100">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="build and deploy tabs">
                        <Tab label="Overview" />
                        <Tab label="App Details" />
                        <Tab label="Build & Deploy" />
                        <Tab label="Build History" />
                        <Tab label="Deployment History" />
                        <Tab label="Deployment Metrics" />
                        <Tab label="App Configuration" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Box className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <Typography variant="h4" className="mb-4">Build & Deploy</Typography>
                <TextField
                    label="Repository URL"
                    variant="outlined"
                    fullWidth
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="mb-4"
                />
                <div className="flex space-x-4 mb-4">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBuild}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        Build
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeploy}
                        disabled={isLoading}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        Deploy
                    </Button>
                </div>
                {isLoading && <CircularProgress className="my-4" />}
                {error && <Typography color="error" className="my-4">{error}</Typography>}
                {buildLogs && (
                    <Box className="bg-black text-white p-4 rounded-lg h-64 overflow-y-scroll mb-4">
                        <Typography variant="h6" className="mb-2">Build Logs</Typography>
                        <Typography className="whitespace-pre-wrap">{buildLogs}</Typography>
                    </Box>
                )}
                {deployLogs && (
                    <Box className="bg-black text-white p-4 rounded-lg h-64 overflow-y-scroll">
                        <Typography variant="h6" className="mb-2">Deploy Logs</Typography>
                        <Typography className="whitespace-pre-wrap">{deployLogs}</Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
};

export default BuildDeployPage;
