import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { WsbaseUrl } from '../../library/constant';
import { getMethod, postMethod, putMethod } from '../../library/api';
import {
    AppBar, Tabs, Tab, Typography, Button, Box, Toolbar, CircularProgress, MenuItem, Select, FormControl, InputLabel, Card, CardContent
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';

const BuildDeployPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [updatedName, setUpdatedName] = useState('');
    const [containerPort, setContainerPort] = useState('');
    const [updatedRepoUrl, setUpdatedRepoUrl] = useState('');
    const [logs, setLogs] = useState([]);
    const [buildId, setBuildId] = useState(null);
    const [showLogs, setShowLogs] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isDeploying, setIsDeploying] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [deployUrl, setDeployUrl] = useState('');
    const ws = useRef(null);

    useEffect(() => {
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
        const fetchBranches = async () => {
            try {
                const repoUrlParts = app.repoUrl.split('/');
                const username = repoUrlParts[repoUrlParts.length - 2];
                const repoName = repoUrlParts[repoUrlParts.length - 1].replace('.git', '');
                const response = await getMethod(`app/github/branch?username=${username}&repoName=${repoName}`);
                setBranches(response.data);
                setSelectedBranch(response.data[0]);
            } catch (err) {
                setBranches(null);
                setSelectedBranch(null);
                setError('Failed to fetch branches. Please try again.');
            }
        };

        if (app) {
            fetchBranches();
        }
    }, [app]);

    useEffect(() => {
        if (buildId) {
            // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            // const wsUrl = `${WsbaseUrl}app/ws/${buildId}`;

            ws.current = new WebSocket(`${WsbaseUrl}app/ws/${buildId}`);
            // ws.current = new WebSocket(`${WsbaseUrl}app/ws/test`);

            ws.current.onopen = () => {
                console.log('WebSocket connection opened');
            };

            ws.current.onmessage = (event) => {
                console.log(event)
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
        fetchTags();
    }, [buildId]);

    useEffect(() => {
        const fetchDeployUrl = async () => {
            try {
                const response = await getMethod(`app/${appId}/appurl`);
                setDeployUrl(response.data.ingressHost);
            } catch (err) {
                console.error('Failed to fetch deploy URL:', err);
                setDeployUrl('');
            }
        };

        fetchDeployUrl();
    }, [appId]);

    const handleBuild = async () => {
        try {
            setLogs([]);
            setShowLogs(true);
            const response = await postMethod(`app/${appId}/build`, { repoUrl: app.repoUrl, branchName: selectedBranch });
            setBuildId(response.data.buildId);
        } catch (error) {
            setError('Failed to build app. Please try again.');
        }
    };

    const handleDeploy = async () => {
        setIsDeploying(true);
        try {
            const deployData = {
                releaseName: app.name,
                chartPath: "./chart/opslync-chart-0.1.0.tgz",
                values: {
                    fullnameOverride: app.name,
                    tag: selectedTag,
                    repository: "opslync/" + app.name + "-" + appId
                }
            };
            const response = await postMethod(`app/${appId}/deploy`, deployData);
            if (response.status === 200) {
                setDeployUrl(response.data.ingressHost);
            }
        } catch (error) {
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
        } catch (error) {
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

    const fetchTags = async () => {
        try {
            let repository = app.name;
            const response = await getMethod(`app/${appId}/docker/tags?repository=${repository}`);
            if (response.data === null || response.data.length === 0) {
                setTags([]);
                setSelectedTag('');
            } else {
                setTags(response.data);
                setSelectedTag(response.data[0]);
            }
        } catch (err) {
            setTags([]);
            setSelectedTag('');
        }
    };

    useEffect(() => {
        fetchTags();
    }, [app]);

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
                                <InputLabel id="branch-select-label">Branch</InputLabel>
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
                            <div className="flex justify-between items-center">
                                <Typography variant="h5" className="mb-4">Deploy App</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={`https://${deployUrl}`}
                                    target="_blank"
                                    className="bg-blue-500 text-white px-2 py-1 mb-4 rounded hover:bg-blue-600 text-sm"
                                    startIcon={<LinkIcon />}
                                >
                                    URL
                                </Button>
                            </div>
                            <div className="flex items-center mb-4">
                                <FormControl fullWidth>
                                    <InputLabel id="docker-tag-label">Docker Tag</InputLabel>
                                    <Select
                                        labelId="docker-tag-label"
                                        id="tag-select"
                                        label="Docker Tag"
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                    >
                                        {tags.map((tag) => (
                                            <MenuItem key={tag} value={tag}>
                                                {tag}
                                            </MenuItem>
                                        ))}
                                        {tags.length === 0 && <MenuItem value="">No tags available</MenuItem>}
                                    </Select>
                                </FormControl>
                                <button
                                    onClick={fetchTags}
                                    className={`ml-2 p-2 ${tags.length === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}
                                    disabled={tags.length === 0}
                                >
                                    <RefreshIcon />
                                </button>
                            </div>
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