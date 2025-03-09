import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import BuildHistoryList from '../../components/workflow/buildDetails/BuildHistoryList';
import BuildLogs from '../../components/workflow/buildDetails/BuildLogs';
import BuildModal from '../../components/workflow/BuildModal';
import { getMethod, postMethod } from '../../library/api';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { toast } from 'react-toastify';

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
  const [tabValue, setTabValue] = useState(2);
  const [buildStatus, setBuildStatus] = useState({});
  const [pods, setPods] = useState([]);
  const [appDetails, setAppDetails] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const [recentBuilds, setRecentBuilds] = useState([]);

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

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`app/${appId}`);
      setAppDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch app details:', err);
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

  useEffect(() => {
    fetchAppDetails();
        fetchBuildHistory();
    fetchPodStatus();
    const statusInterval = setInterval(fetchPodStatus, 10000);

    return () => {
      clearInterval(statusInterval);
      if (wsConnection) {
        wsConnection.close();
      }
    };
    }, [appId]);

  useEffect(() => {
    const paths = [
      `/app/${appId}/details`,
      `/app/${appId}/build-history`,
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
            `/app/${appId}/build-history`,
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
    const token = localStorage.getItem('token');
    const wsUrl = `${wsBase}app/${appId}/workflows/build/logs?workflowID=${workflowId}&token=${token}`;
    
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
        connectWebSocket(builds[0].id);
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
    setShowLogs(true); // Show logs when a build is selected
    connectWebSocket(buildId); // Connect WebSocket when build is selected
  };

  const handleBuildClick = () => {
    setShowBuildModal(true);
  };

  const handleBuildStart = (workflowId) => {
    setShowBuildModal(false);
    setSelectedWorkflowId(workflowId);
    setLogs([]);
    fetchBuildHistory();
  };

  const handleDeploy = async () => {
    if (!selectedBuild) {
      setDeployError('Please select a build to deploy');
      return;
    }
    setDeployError(null);
    setDeployLoading(true);
    try {
      await postMethod(`app/${appId}/deploy`, {
        "tag": selectedBuild.commitHash,
        "ingress.enabled": "false"
      });
      setShowDeployModal(false);
      // Show success message
      toast.success('Deployment completed successfully!');
      // Redirect to app details page after a short delay
      setTimeout(() => {
        history.push(`/app/${appId}/details`);
      }, 1500);
    } catch (err) {
      setDeployError(err.response?.data?.message || 'Failed to deploy application. Please try again.');
    } finally {
      setDeployLoading(false);
    }
  };

  const handleDeployClick = () => {
    if (selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'succeeded') {
      const selectedBuildInfo = buildHistory.find(build => build.id === selectedWorkflowId);
      setSelectedBuild(selectedBuildInfo);
      setShowDeployModal(true);
    }
  };

  const DeployModal = () => (
    <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Deploy Application</DialogTitle>
        </DialogHeader>
        
        <ScrollArea.Root className="max-h-[400px] mt-4 overflow-hidden">
          <ScrollArea.Viewport className="h-full w-full">
            <div className="space-y-3 pr-4">
              {buildHistory.map((build) => (
                <div 
                  key={build.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer bg-white transition-all ${
                    selectedBuild?.id === build.id 
                      ? 'border-blue-500 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                  onClick={() => setSelectedBuild(build)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {build.commitMessage}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                        {build.commitHash}
                      </span>
                      <span className="text-xs text-gray-500">
                        {build.startTime}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-gray-100 transition-colors hover:bg-gray-200"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>

        {deployError && (
          <div className="mt-4 text-sm text-red-600">
            {deployError}
          </div>
        )}

        <DialogFooter className="mt-4 border-t pt-4 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setShowDeployModal(false)}
            className="border-gray-200 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={deployLoading || !selectedBuild}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {deployLoading ? 'Deploying...' : 'Deploy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

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

      {/* Navigation Tabs */}
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

      {/* Build Pipeline */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Build Pipeline</h2>
        <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Source Card */}
          <div className="relative p-6 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
               onClick={handleBuildClick}>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Source</h3>
              <p className="text-sm text-gray-600 text-center">Git repository configuration</p>
              <p className="text-xs text-blue-600 mt-2">Click to start new build</p>
            </div>
            {/* Arrow */}
            <div className="absolute -right-5 top-1/2 transform -translate-y-1/2 z-10">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Build Card */}
          <div className="relative p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${selectedWorkflowId ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-4`}>
                <svg className={`w-6 h-6 ${selectedWorkflowId ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Build</h3>
              <p className="text-sm text-gray-600 text-center">Build configuration and settings</p>
              {selectedWorkflowId && buildStatus[selectedWorkflowId] && (
                <p className={`text-xs mt-2 ${buildStatus[selectedWorkflowId].status === 'succeeded' ? 'text-green-600' : buildStatus[selectedWorkflowId].status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {buildStatus[selectedWorkflowId].status} - {buildStatus[selectedWorkflowId].buildTime}
                </p>
              )}
            </div>
            {/* Arrow */}
            <div className="absolute -right-5 top-1/2 transform -translate-y-1/2 z-10">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Deploy Card */}
          <div 
            className={`p-6 bg-white rounded-lg shadow-md ${
              selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'succeeded' 
                ? 'cursor-pointer hover:shadow-lg transition-shadow' 
                : ''
            }`}
            onClick={handleDeployClick}
          >
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 ${selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'succeeded' ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-4`}>
                <svg className={`w-6 h-6 ${selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'succeeded' ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7z" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Deploy</h3>
              <p className="text-sm text-gray-600 text-center">Deployment configuration</p>
              {selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'succeeded' && (
                <p className="text-xs text-blue-600 mt-2">Click to deploy</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Build History and Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Builds</h2>
            {selectedWorkflowId && (
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showLogs ? 'Hide Logs' : 'Show Logs'}
              </button>
            )}
          </div>
          <BuildHistoryList
            builds={buildHistory}
            onBuildSelect={handleBuildSelect}
            selectedBuildId={selectedWorkflowId}
            buildStatus={buildStatus}
          />
        </div>

        {selectedWorkflowId && showLogs && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Build Logs</h2>
            <BuildLogs logs={logs} />
          </div>
        )}
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

      {showDeployModal && <DeployModal />}
        </div>
    );
};

export default BuildHistoryPage;
