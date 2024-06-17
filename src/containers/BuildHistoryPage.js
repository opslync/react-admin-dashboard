import React, { useState, useEffect } from 'react';
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
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    Modal,
    Box,
    Button,
} from '@mui/material';
import { getMethod } from '../library/api';
import { useParams, useHistory, useLocation } from 'react-router-dom';

const BuildHistoryPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(3); // Default to "Build History"
    const [open, setOpen] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState('');

    useEffect(() => {
        const fetchBuildHistory = async () => {
            try {
                const response = await getMethod(`app/${appId}/build-history`);
                setBuilds(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch build history. Please try again.');
                setLoading(false);
            }
        };

        fetchBuildHistory();
    }, [appId]);

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
    }, [location.pathname, appId]);

    const handleOpen = (logs) => {
        setSelectedLogs(logs);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedLogs('');
    };

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
                        <Tab label="Metrics" />
                        <Tab label="App Configuration" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Typography variant="h4" className="mb-6">Build History</Typography>
            <Card className="mb-6">
                <CardContent>
                    <Typography variant="h5" className="mb-4">Build Details</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Build ID</TableCell>
                                    <TableCell>Commit ID</TableCell>
                                    <TableCell>When</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Logs</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {builds.map((build) => (
                                    <TableRow key={build.buildId}>
                                        <TableCell>{build.buildId}</TableCell>
                                        <TableCell>{build.commitID}</TableCell>
                                        <TableCell>{moment(build.createdAt).format('MMMM Do YYYY, h:mm:ss a')}</TableCell>
                                        <TableCell>{build.status}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="primary" size="small" onClick={() => handleOpen(build.logs)}>
                                                View Logs
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="log-modal-title"
                aria-describedby="log-modal-description"
            >
                <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-3xl bg-white p-4 rounded shadow-lg overflow-y-auto max-h-96">
                    <Typography id="log-modal-title" variant="h6" component="h2" className="mb-4">
                        Build Logs
                    </Typography>
                    <Typography id="log-modal-description" component="pre" className="bg-gray-100 p-2 rounded max-w-lg overflow-x-auto whitespace-pre-wrap">
                        {selectedLogs}
                    </Typography>
                    <Button onClick={handleClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Close
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default BuildHistoryPage;
