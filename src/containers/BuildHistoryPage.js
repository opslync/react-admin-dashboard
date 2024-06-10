import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    AppBar,
    Tabs,
    Tab,
    Toolbar,
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMethod } from '../library/api';
import { useParams, Link, useHistory, useLocation } from 'react-router-dom';

const BuildHistoryPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMap, setStatusMap] = useState({});
    const [tabValue, setTabValue] = useState(3); // Default to "Build History"

    useEffect(() => {
        const fetchBuildHistory = async () => {
            try {
                const response = await getMethod('builds');
                setBuilds(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch build history. Please try again.');
                setLoading(false);
            }
        };

        fetchBuildHistory();
    }, []);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const statusPromises = builds.map(async (build) => {
                    const response = await getMethod(`build/status?buildId=${build.ID}`);
                    return { buildId: build.ID, status: response.data.status };
                });
                const statusResults = await Promise.all(statusPromises);
                const statusMap = statusResults.reduce((map, { buildId, status }) => {
                    map[buildId] = status;
                    return map;
                }, {});
                setStatusMap(statusMap);
            } catch (err) {
                console.error('Failed to fetch build status:', err);
            }
        };

        if (builds.length) {
            fetchStatus();
            const intervalId = setInterval(fetchStatus, 300000); // Fetch status every 5 minutes
            return () => clearInterval(intervalId); // Cleanup interval on component unmount
        }
    }, [builds]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            "/deployment-metrics",
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
            "/deployment-metrics",
            "/app-configuration",
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname, appId]);

    const statusCounts = builds.reduce((acc, build) => {
        const status = statusMap[build.ID] || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="build history tabs">
                        <Tab label="App Details" />
                        <Tab label="Build & Deploy" />
                        <Tab label="Build History" />
                        <Tab label="Deployment History" />
                        <Tab label="Deployment Metrics" />
                        <Tab label="App Configuration" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Typography variant="h4" className="mb-6">Build History</Typography>
            <Card className="mb-6">
                <CardContent>
                    <Typography variant="h5" className="mb-4">Build Status Chart</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h5" className="mb-4">Build Details</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Build ID</TableCell>
                                    <TableCell>App Name</TableCell>
                                    <TableCell>Commit ID</TableCell>
                                    <TableCell>When</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {builds.map((build) => (
                                    <TableRow key={build.ID}>
                                        <TableCell>{build.ID}</TableCell>
                                        <TableCell>{build.appName}</TableCell>
                                        <TableCell>{build.commitId}</TableCell>
                                        <TableCell>{moment(build.CreatedAt).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                        <TableCell>{statusMap[build.ID] || 'Unknown'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default BuildHistoryPage;
