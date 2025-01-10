import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    Typography,
    Grid,
    CircularProgress,
    Paper,
    Box,
} from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const AppMetricsPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(4); // Default to "Metrics"
    const [metricsData, setMetricsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const namespace = 'argo'; // Namespace is set to "argo" by default

    const [cpuUsage, setCpuUsage] = useState(0);
    const [memoryUsage, setMemoryUsage] = useState(0);
    const [diskUsage, setDiskUsage] = useState(0);

    const [cpuTrend, setCpuTrend] = useState([10, 20, 15, 30, 25]);
    const [memoryTrend, setMemoryTrend] = useState([30, 50, 40, 60, 55]);
    const [diskTrend, setDiskTrend] = useState([20, 25, 30, 28, 32]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            // `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            `/app/${appId}/app-settings`,
        ];
        history.push(paths[newValue]);
    };

    const setupWebSocket = () => {
        setLoading(true);
        setMetricsData([]);
        setError('');

        if (window.currentWebSocket) {
            window.currentWebSocket.close();
        }

        const ws = new WebSocket(`ws://localhost:8080/api/pods/metrics/stream?namespace=${namespace}`);

        ws.onopen = () => {
            console.log(`Connected to WebSocket for namespace: ${namespace}`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.pods) {
                    setMetricsData(data.pods);
                }

                setCpuUsage((Math.random() * 10).toFixed(1));
                setMemoryUsage((Math.random() * 40).toFixed(1));
                setDiskUsage((Math.random() * 30).toFixed(1));

                setCpuTrend((prev) => [...prev.slice(1), Math.random() * 100]);
                setMemoryTrend((prev) => [...prev.slice(1), Math.random() * 100]);
                setDiskTrend((prev) => [...prev.slice(1), Math.random() * 100]);
                setLoading(false);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                setError('Failed to parse WebSocket message');
                setLoading(false);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Failed to connect to WebSocket');
            setLoading(false);
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        window.currentWebSocket = ws;

        return () => {
            ws.close();
        };
    };

    useEffect(() => {
        setupWebSocket();
    }, []);

    const renderCard = (title, percentage, trend, color) => (
        <Paper
            elevation={3}
            style={{
                padding: '16px',
                backgroundColor: '#1e1e1e',
                color: 'white',
                borderRadius: '8px',
                textAlign: 'center',
            }}
        >
            <Typography variant="h6">{title}</Typography>
            <Box
                sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    margin: '16px 0',
                }}
            >
                <CircularProgress
                    variant="determinate"
                    value={percentage}
                    style={{
                        color: color,
                        width: '80px',
                        height: '80px',
                    }}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography variant="h6" component="div">
                        {percentage}%
                    </Typography>
                </Box>
            </Box>
            <ResponsiveContainer width="100%" height={50}>
                <LineChart data={trend.map((value, index) => ({ name: index, value }))}>
                    <Line type="monotone" dataKey="value" stroke={color} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="app detail tabs">
                        <Tab label="App Details" />
                        <Tab label="Build & Deploy" />
                        <Tab label="Build History" />
                        {/* <Tab label="Deployment History" /> */}
                        <Tab label="Metrics" />
                        <Tab label="App Settings" />
                    </Tabs>
                </Toolbar>
            </AppBar>

            <Typography variant="h6" className="mb-6">Live App Metrics</Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    {renderCard('CPU', cpuUsage, cpuTrend, '#ff7043')}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderCard('Memory', memoryUsage, memoryTrend, '#42a5f5')}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderCard('Disk', diskUsage, diskTrend, '#66bb6a')}
                </Grid>
            </Grid>
        </div>
    );
};

export default AppMetricsPage;
