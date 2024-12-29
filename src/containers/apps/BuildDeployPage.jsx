import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkflowCanvas from '../../components/workflow/WorkflowCanvas';
import BuildModal from '../../components/workflow/BuildModal';
import { getMethod } from '../../library/api';

const BuildDeployPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(1); // Default to "Build & Deploy"
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [appDetails, setAppDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

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
    if (activeTab !== -1) {
      setTabValue(activeTab);
    }
  }, [location.pathname, appId]);

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

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`app/${appId}`);
      setAppDetails(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch app details');
      setLoading(false);
    }
  };

  const handleBuildClick = () => {
    setShowBuildModal(true);
  };

  const handleBuildStart = (workflowId) => {
    setShowBuildModal(false);
    history.push(`/app/${appId}/build-history`, { selectedWorkflowId: workflowId });
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
        <p className="text-gray-600">Loading workflow...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <div className="flex items-center mb-4">
        <IconButton onClick={() => history.push('/apps')} className="mr-2">
          <ArrowBackIcon />
        </IconButton>
      </div>

      <AppBar position="static" color="default" className="mb-4">
        <Toolbar>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="build deploy tabs" variant="scrollable" scrollButtons="auto">
            <Tab label="App Details" />
            <Tab label="Build & Deploy" />
            <Tab label="Build History" />
            <Tab label="Deployment History" />
            <Tab label="Metrics" />
            <Tab label="App Configuration" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <div className="bg-white rounded-lg shadow-sm p-6 relative">
        <WorkflowCanvas 
          onBuildClick={handleBuildStart}
          appId={appId}
        />
      </div>

      {showBuildModal && (
        <BuildModal
          open={showBuildModal}
          onClose={() => setShowBuildModal(false)}
          onBuildStart={handleBuildStart}
          appId={appId}
          appDetails={appDetails}
        />
      )}
    </div>
  );
};

export default BuildDeployPage;