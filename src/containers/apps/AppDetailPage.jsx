import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, putMethod } from '../../library/api';
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
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const AppDetailPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [deployments, setDeployments] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    buildPack: 'dockerfile',
    repoUrl: '',
    port: '3000',
    branch: ''
  });

  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        const response = await getMethod(`app/${appId}`);
        const data = response.data;
        setFormData({
          name: data.name || '',
          description: data.description || '',
          buildPack: 'dockerfile',
          repoUrl: data.repoUrl || '',
          port: data.port || '3000',
          branch: data.branch || ''
        });

        // Set the branch from app detail
        const branch = data.branch;
        setBranches([branch]);
        setSelectedBranch(branch);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch app details. Please try again.');
        setLoading(false);
      }
    };

    fetchAppDetails();
  }, [appId]);

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

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSelectChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');

      // Validate required fields
      if (!formData.name || !formData.buildPack || !formData.port || !formData.branch) {
        setError('Please fill in all required fields');
        return;
      }

      const response = await putMethod(`app/${appId}`, {
        name: formData.name,
        description: formData.description,
        buildPack: formData.buildPack,
        repoUrl: formData.repoUrl,
        port: formData.port,
        branch: formData.branch
      });

      if (response.data) {
        // Show success message using toast or other notification
        console.log('App updated successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update app. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const handleBack = () => {
    history.push('/apps');
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

  const handleBuild = async () => {
    // Add your build logic here
  };

  const handleClearError = () => {
    setError('');
  };

  if (loading) return <CircularProgress />;
  if (error) return (
    <div className="flex flex-col lg:ml-64 p-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded relative">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
        <button
          onClick={handleClearError}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-4">
        <IconButton onClick={handleBack} className="mr-2">
          <ArrowBackIcon />
        </IconButton>
      </div>
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
      <Grid container spacing={3}>
        {deployments.length > 0 && (
          <>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Application Status</Typography>
                  <Grid container spacing={2}>
                    {chartData.map((data, index) => (
                      <Grid item key={index} >
                        <Typography variant="body2" color="textSecondary">
                          {data.name}
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
                    {deployments[0].tag}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <div className="flex justify-between items-center mb-4">
            {/* <Typography variant="h4">App Details</Typography> */}
          </div>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={formData.name}
                      onChange={handleInputChange('name')}
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      placeholder="Enter description"
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>
                      Build Pack <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.buildPack}
                      onValueChange={handleSelectChange('buildPack')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select build pack" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dockerfile">Dockerfile</SelectItem>
                        <SelectItem value="buildpacks">Buildpacks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>
                      Repository URL
                    </Label>
                    <Input 
                      value={formData.repoUrl}
                      onChange={handleInputChange('repoUrl')}
                      placeholder="Enter repository URL"
                    />
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>
                      Branch <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={selectedBranch}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, branch: value }));
                        setSelectedBranch(value);
                      }}
                      disabled={true}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedBranch} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(branches) && branches.length > 0 && branches.map((branchName) => (
                          <SelectItem key={branchName} value={branchName}>
                            {branchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <div className="space-y-2">
                    <Label>
                      Application Port <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      value={formData.port}
                      onChange={handleInputChange('port')}
                      placeholder="Enter application port"
                      type="number"
                      min="1"
                      max="65535"
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4 relative">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <div className="mt-2 text-sm text-red-700">{error}</div>
                        </div>
                      </div>
                      <button
                        onClick={handleClearError}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200 ease-in-out rounded-lg shadow-md px-4 py-2"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AppDetailPage;