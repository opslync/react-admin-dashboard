import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import BuildHistoryList from '../../components/workflow/buildDetails/BuildHistoryList';
import BuildLogs from '../../components/workflow/buildDetails/BuildLogs';
import { getMethod } from '../../library/api';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../library/constant';
import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BuildHistoryPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [buildHistory, setBuildHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [tabValue, setTabValue] = useState(2); // Default to "Build History"
  const [buildStatus, setBuildStatus] = useState({});
  const [pods, setPods] = useState([]);
  const [appDetails, setAppDetails] = useState(null);

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

  useEffect(() => {
    fetchAppDetails();
    fetchBuildHistory();
    fetchPodStatus();
    return () => {
      // Cleanup WebSocket connection on unmount
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [appId]);

  useEffect(() => {
    if (selectedWorkflowId) {
      connectWebSocket(selectedWorkflowId);
    }
  }, [selectedWorkflowId]);

  useEffect(() => {
    const paths = [
      `/app/${appId}/details`,
      `/app/${appId}/build-deploy`,
      `/app/${appId}/build-history`,
      // `/app/${appId}/deployment-history`,
      `/app/${appId}/metrics`,
      `/app/${appId}/app-settings`,
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
      // `/app/${appId}/deployment-history`,
      `/app/${appId}/metrics`,
      `/app/${appId}/app-settings`,
    ];
    history.push(paths[newValue]);
  };

  const calculateBuildTime = (startedAt, finishedAt) => {
    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    const diffInSeconds = Math.floor((end - start) / 1000);
    
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    
    return `${minutes}m ${seconds}s`;
  };

  const checkBuildStatus = async (workflowId) => {
    try {
      const response = await getMethod(`app/${appId}/workflows/build/status?workflowID=${workflowId}`);
      const { phase, startedAt, finishedAt } = response.data;
      
      const buildTime = calculateBuildTime(startedAt, finishedAt);
      const status = phase.toLowerCase();
      
      setBuildStatus(prev => ({
        ...prev,
        [workflowId]: {
          status,
          buildTime,
          startedAt,
          finishedAt
        }
      }));

      // Update build history with new status
      setBuildHistory(prev => prev.map(build => {
        if (build.id === workflowId) {
          return {
            ...build,
            status: status === 'succeeded' ? 'success' : status,
            duration: buildTime
          };
        }
        return build;
      }));

      // Add final status message to logs
      if (status === 'succeeded' || status === 'failed') {
        setLogs(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: `Build ${status} (Duration: ${buildTime})`,
          level: status === 'succeeded' ? 'success' : 'error'
        }]);
      }

    } catch (error) {
      console.error('Error checking build status:', error);
    }
  };

  const connectWebSocket = (workflowId) => {
    // Close existing connection if any
    if (wsConnection) {
      wsConnection.close();
    }

    // Replace http/https with ws/wss in the API URL
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const wsUrl = `${wsBase}app/${appId}/workflows/build/logs?workflowID=${workflowId}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: 'Connecting to build logs...',
        level: 'info'
      }]);
    };

    ws.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        let logData = JSON.parse(event.data);
        
        // Extract content from the result object
        if (logData.result && logData.result.content) {
          const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: logData.result.content,
            level: 'info'
          };
          console.log('Parsed log:', newLog);
          setLogs(prev => [...prev, newLog]);
        }
      } catch (error) {
        console.log('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: 'Error connecting to build logs',
        level: 'error'
      }]);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setLogs(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: 'Build logs completed',
        level: 'info'
      }]);

      // Check build status after WebSocket disconnects
      checkBuildStatus(workflowId);
    };

    setWsConnection(ws);
  };

  const fetchBuildHistory = async () => {
    try {
      const response = await getMethod(`app/${appId}/workflows/builds`);
      const builds = response.data.map(build => ({
        id: build.workflowID,
        commitHash: build.commitId,
        commitMessage: build.commitMessage,
        startTime: new Date(build.startTime).toLocaleString(),
        status: 'pending',
        duration: '...'
      }));

      setBuildHistory(builds);

      // Select first build by default if none selected
      if (!selectedWorkflowId && builds.length > 0) {
        setSelectedWorkflowId(builds[0].id);
      }

      // Check status for each build
      builds.forEach(build => {
        checkBuildStatus(build.id);
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch build history');
      setLoading(false);
    }
  };

  const handleBuildSelect = (buildId) => {
    setSelectedWorkflowId(buildId);
    setLogs([]); // Clear existing logs
  };

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`app/${appId}`);
      setAppDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch app details:', err);
      setError('Failed to fetch app details');
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

  if (loading) {
    return (
      <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
        <p className="text-gray-600">Loading build history...</p>
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
      {/* App Name Header with Status */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold">{appDetails?.name || 'Build History'}</h1>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(pods[0]?.status)} ${
            pods[0]?.status === 'Running' ? 'animate-pulse' : ''
          }`} />
          <span className="text-sm font-medium">{pods[0]?.status || 'Unknown'}</span>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex items-center mb-6">
        <IconButton onClick={() => history.push('/apps')} className="mr-2">
          <ArrowBackIcon />
        </IconButton>
      </div>

      {/* Navigation */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Build History</h2>
          <BuildHistoryList
            builds={buildHistory}
            currentBuildId={selectedWorkflowId}
            onBuildSelect={handleBuildSelect}
          />
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Build Logs</h2>
          <BuildLogs 
            logs={logs}
          />
        </div>
      </div>
    </div>
  );
};

export default BuildHistoryPage;
