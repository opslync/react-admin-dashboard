import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod } from '../../library/api';
import moment from 'moment';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  CircularProgress,
} from '@mui/material';

const AppDetailPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [deployments, setDeployments] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(1); // Default to "App Details"

  useEffect(() => {
    // Fetch deployment history
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
        const cachedStatus = localStorage.getItem(`podStatus-${appId}`);
        const now = new Date();

        if (cachedStatus) {
          const parsedCache = JSON.parse(cachedStatus);
          if (now - new Date(parsedCache.timestamp) < 300000) { // 5 minutes cache
            setStatusMap(parsedCache.data);
            return;
          }
        }

        const statusPromises = deployments.map(async (deployment) => {
          const response = await getMethod(`app/${appId}/pod/status`);
          return { releaseName: deployment.releaseName, status: response.data[0].status };
        });

        const statusResults = await Promise.all(statusPromises);
        const newStatusMap = statusResults.reduce((map, { releaseName, status }) => {
          map[releaseName] = status;
          return map;
        }, {});

        setStatusMap(newStatusMap);
        localStorage.setItem(`podStatus-${appId}`, JSON.stringify({ data: newStatusMap, timestamp: new Date() }));
      } catch (err) {
        console.error('Failed to fetch pod status:', err);
      }
    };

    if (deployments.length) {
      const cachedStatus = localStorage.getItem(`podStatus-${appId}`);
      if (cachedStatus) {
        const parsedCache = JSON.parse(cachedStatus);
        setStatusMap(parsedCache.data);
      }
      fetchStatus();
      const intervalId = setInterval(fetchStatus, 300000); // Fetch status every 5 minutes
      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [deployments, appId]);

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
      <Typography variant="h4" className="mb-6">App Details</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Application Status</Typography>
              <Grid container spacing={2}>
                {chartData.map((data, index) => (
                  <Grid item key={index} >
                    <Typography variant="body2" color="textSecondary">
                      {deployments.length > 0 ? data.name : 'Unknown'}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Deployed Commit</Typography>
              <Typography variant="body2" color="textSecondary">
                {deployments.length > 0 ? deployments[0].tag : 'No commit found'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AppDetailPage;