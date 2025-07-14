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
  const [tabValue, setTabValue] = useState(1);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [appDetails, setAppDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pods, setPods] = useState([]);

  useEffect(() => {
    fetchAppDetails();
    fetchPodStatus();
    const statusInterval = setInterval(fetchPodStatus, 10000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [appId]);

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

  const fetchPodStatus = async () => {
    try {
      const response = await getMethod(`app/${appId}/pod/list`);
      setPods(response.data);
    } catch (err) {
      console.error('Failed to fetch pod status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const paths = [
      `/app/${appId}/details`,
      `/app/${appId}/build-deploy`,
      `/app/${appId}/build-history`,
      `/app/${appId}/metrics`,
      `/app/${appId}/app-settings`,
    ];
    history.push(paths[newValue]);
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
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold">{appDetails?.name || 'Build & Deploy'}</h1>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(pods[0]?.status)} ${
            pods[0]?.status === 'Running' ? 'animate-pulse' : ''
          }`} />
          <span className="text-sm font-medium">{pods[0]?.status || 'Unknown'}</span>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <IconButton onClick={() => history.push('/apps')} className="mr-2">
          <ArrowBackIcon />
        </IconButton>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="app detail tabs" 
          variant="scrollable" 
          scrollButtons="auto"
          className="bg-white"
        >
          <Tab 
            icon={<div className="mr-2">📄</div>} 
            label="App Details" 
            iconPosition="start"
          />
          <Tab 
            icon={<div className="mr-2">⚙️</div>} 
            label="Build & Deploy" 
            iconPosition="start"
          />
          <Tab 
            icon={<div className="mr-2">📜</div>} 
            label="Build History" 
            iconPosition="start"
          />
          <Tab 
            icon={<div className="mr-2">📈</div>} 
            label="Metrics" 
            iconPosition="start"
          />
          <Tab 
            icon={<div className="mr-2">⚡</div>} 
            label="Configuration" 
            iconPosition="start"
          />
        </Tabs>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 relative">
        <WorkflowCanvas 
          onBuildClick={handleBuildStart}
          appId={appId}
        />
      </div>

      <BuildModal
        open={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        onStartBuild={handleBuildStart}
        appId={appId}
        appDetails={appDetails}
      />
    </div>
  );
};

export default BuildDeployPage;