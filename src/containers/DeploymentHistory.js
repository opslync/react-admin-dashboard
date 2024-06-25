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

const DeploymentHistory = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [tabValue, setTabValue] = useState(4); // Default to "Deployment History"

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

  const statusCounts = deployments.reduce((acc, deployment) => {
    const status = statusMap[deployment.releaseName] || 'Unknown';
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
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="deployment history tabs">
            <Tab label="App Details" />
            <Tab label="Build & Deploy" />
            <Tab label="Build History" />
            <Tab label="Deployment History" />
            <Tab label="Metrics" />
            <Tab label="App Configuration" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Card>
        <CardContent>
          <Typography variant="h5" className="mb-4">Deployment Details</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>App Name</TableCell>
                  <TableCell>CommitId</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map((deployment) => (
                  <TableRow key={deployment.ID}>
                    <TableCell>{deployment.releaseName}</TableCell>
                    <TableCell>{deployment.tag}</TableCell>
                    <TableCell>{deployment.CreatedAt}</TableCell>
                    <TableCell>{deployment.username}</TableCell>
                    <TableCell>{statusMap[deployment.releaseName] || 'Unknown'}</TableCell>
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

export default DeploymentHistory
