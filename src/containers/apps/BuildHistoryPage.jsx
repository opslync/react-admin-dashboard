import React, { useState, useEffect, memo } from 'react';
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
    CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { toast } from 'react-toastify';

// Move DeployModal outside the main component and memoize it
const DeployModal = memo(function DeployModal({
  open,
  onOpenChange,
  buildHistory,
  selectedBuild,
  setSelectedBuild,
  deployError,
  handleDeploy,
  deployLoading
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="border-gray-200 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={deployLoading || !selectedBuild}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {deployLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Deploying...
              </>
            ) : (
              'Deploy'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

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
  const [optimisticBuild, setOptimisticBuild] = useState(null);

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
    fetchPodStatus(); // Only call once on mount/appId change
    // Remove the interval polling for pod status
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [appId]);

  useEffect(() => {
    const paths = [
      `/app/${appId}/details`,
      `/app/${appId}/build-history`,
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
            `/app/${appId}/app-settings`,
        ];
        history.push(paths[newValue]);
    };

  const calculateBuildTime = (startedAt, finishedAt) => {
    if (!startedAt || !finishedAt) return 'In progress…';
    const start = new Date(startedAt);
    const end = new Date(finishedAt);
    if (isNaN(start) || isNaN(end) || end <= start) return 'In progress…';
    const diffInSeconds = Math.floor((end - start) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const checkBuildStatus = async (workflowId) => {
    try {
      const response = await getMethod(`app/${appId}/workflows/build/status?workflowID=${workflowId}`);
      const statusObj = response.data.status;
      if (!statusObj) {
        console.warn('[BuildHistory] checkBuildStatus: status is undefined for workflowId', workflowId, 'response:', response);
        return;
      }
      const { phase, startedAt, finishedAt } = statusObj;
      if (!phase) {
        console.warn('[BuildHistory] checkBuildStatus: phase is undefined for workflowId', workflowId, 'response:', response);
      }
      const status = phase ? phase.toLowerCase() : 'unknown';
      
      const buildTime = calculateBuildTime(startedAt, finishedAt);
      
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

  const detectLogLevel = (message) => {
    if (!message || typeof message !== 'string') return 'info';
    const msg = message.toLowerCase();
    if (msg.includes('error') || msg.includes('failed') || msg.includes('exception')) return 'error';
    if (msg.includes('warn') || msg.includes('warning')) return 'warning';
    if (msg.includes('success') || msg.includes('completed') || msg.includes('done')) return 'success';
    if (msg.includes('info') || msg.includes('starting') || msg.includes('connected')) return 'info';
    return 'info';
  };

  const connectWebSocket = (workflowId) => {
    // Close existing connection if any
    if (wsConnection) {
      wsConnection.close();
    }

    // Replace http/https with ws/wss in the API URL
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const token = localStorage.getItem('token');
    // Ensure there is always a slash between base and path
    const wsUrl = `${wsBase.endsWith('/') ? wsBase : wsBase + '/'}api/app/${appId}/workflows/build/logs?workflowID=${workflowId}&token=${token}`;
    
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
      let content;
      let logFormat = 'unknown';
      try {
        const trimmedData = event.data.trim();
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
          // Looks like JSON, try to parse it
          let logData = JSON.parse(event.data);
          // Extract content from the result object or common fields
          content = (logData.result && logData.result.content) || logData.content || logData.message || logData.log || logData.text || String(event.data || '');
          logFormat = 'JSON';
        } else {
          // Doesn't look like JSON, treat as plain text
          content = String(event.data || '');
          logFormat = 'Plain Text';
        }
      } catch (error) {
        // JSON parse failed, fallback to plain text
        content = String(event.data || '');
        logFormat = 'Plain Text (fallback)';
      }
      // Skip empty content
      if (!content || content.trim() === '') return;
      // Filter out unwanted log lines
      if (content.includes('level=info msg="sub-process exited" argo=true error="<nil>"')) return;
      // Detect log level
      const detectedLevel = detectLogLevel(content);
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        message: content,
        level: detectedLevel,
        format: logFormat
      };
      setLogs(prev => [...prev, newLog]);
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

  // Helper to fetch logs from the new REST endpoint for completed builds
  const fetchLogsFromDb = async (workflowId) => {
    setLogs([]);
    try {
      const response = await getMethod(`/workflow/${workflowId}/logs/db`);
      // logs is a string with newlines, not an array
      const logString = response.data.logs || '';
      const lines = logString.split('\n').filter(Boolean); // remove empty lines
      // Use startTime or endTime from response for timestamp if available
      const timestamp = response.data.startTime || response.data.endTime || new Date().toISOString();
      const formattedLogs = lines.map((line, idx) => ({
        id: idx,
        timestamp: timestamp,
        message: line,
        level: detectLogLevel(line)
      }));
      setLogs(formattedLogs);
    } catch (err) {
      setLogs([{ id: 0, timestamp: new Date().toLocaleTimeString(), message: 'Failed to fetch logs from database.', level: 'error' }]);
    }
  };

  const fetchBuildHistory = async () => {
    setError(null); // Clear error at the start of fetch
    try {
      const response = await getMethod(`app/${appId}/workflows/builds`);
      let builds = (response.data.builds || []).map(build => ({
        id: build.workflowId,
        commitHash: build.commitId,
        commitMessage: build.commitMessage,
        startTime: new Date(build.startTime).toLocaleString(),
        status: build.status ? build.status.toLowerCase() : 'pending',
        duration: '...'
      }));
      // Merge optimistic build if it exists and not present in backend builds
      if (optimisticBuild && !builds.some(b => b.id === optimisticBuild.id)) {
        builds = [optimisticBuild, ...builds];
      }
      setBuildHistory(builds);

      // Preserve selectedBuild if it still exists, otherwise clear only if modal is not open
      if (!showDeployModal && selectedBuild && !builds.some(b => b.id === selectedBuild.id)) {
        setSelectedBuild(null);
      }

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
      setError(null); // Clear any previous error
    } catch (err) {
      setBuildHistory([]); // Clear builds on error
      setError('Failed to fetch build history. Please check your connection or try again.');
      setLoading(false);
    }
  };

  const handleBuildSelect = (buildId) => {
    setSelectedWorkflowId(buildId);
    setLogs([]); // Clear existing logs
    setShowLogs(true); // Show logs when a build is selected
    // Find the build and its status
    const build = buildHistory.find(b => b.id === buildId);
    const status = buildStatus[buildId]?.status || build?.status;
    // If running or pending, use WebSocket
    if (status === 'running' || status === 'pending') {
      connectWebSocket(buildId);
    } else {
      // Otherwise, fetch from DB and close any open WebSocket
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
      fetchLogsFromDb(buildId);
    }
  };

  const handleBuildClick = () => {
    setShowBuildModal(true);
  };

  const handleBuildStart = (commit, workflowId) => {
    setShowBuildModal(false);
    // Wait 2 seconds before reloading the page
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
        "ingress.enabled": "true"
      });
      setShowDeployModal(false); // Only close after success
      toast.success('Deployment completed successfully!');
      fetchBuildHistory(); // Refresh builds in the background
      // Optionally: setSelectedBuild(null);
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

  if (loading) {
    return (
      <div className="flex flex-col p-4 bg-gray-100 min-h-screen">
        <p className="text-gray-600">Loading build history...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col p-4 bg-gray-100 min-h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-max"
          onClick={() => {
            console.debug('[BuildHistory] Retry button clicked');
            setLoading(true);
            fetchBuildHistory();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Always show the build pipeline UI, even if there are no builds
  return (
    <div className="relative">
      <div className={`transition-all duration-300 ${showBuildModal || showDeployModal ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
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
                  {/* Show spinner if build is running */}
                  {selectedWorkflowId && buildStatus[selectedWorkflowId]?.status === 'running' ? (
                    <CircularProgress size={28} color="primary" />
                  ) : (
                    <svg className={`w-6 h-6 ${selectedWorkflowId ? 'text-blue-600' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">Build</h3>
                <p className="text-sm text-gray-600 text-center">Build configuration and settings</p>
                {selectedWorkflowId && buildStatus[selectedWorkflowId] && (
                  <p className={`text-xs mt-2 ${buildStatus[selectedWorkflowId].status === 'succeeded' ? 'text-green-600' : buildStatus[selectedWorkflowId].status === 'failed' ? 'text-red-600' : buildStatus[selectedWorkflowId].status === 'running' ? 'text-yellow-600' : ''}`}>
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
            </div>
            {buildHistory.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No builds yet. Start your first build!
              </div>
            ) : (
              <BuildHistoryList
                builds={buildHistory}
                onBuildSelect={handleBuildSelect}
                currentBuildId={selectedWorkflowId}
                buildStatus={buildStatus}
              />
            )}
          </div>

          {selectedWorkflowId && showLogs && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold mb-0">Build Logs</h2>
                <button
                  className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 text-gray-700 ml-2"
                  onClick={() => setShowLogs(false)}
                >
                  Hide Logs
                </button>
              </div>
              <BuildLogs logs={logs} />
            </div>
          )}
        </div>
      </div>
      {/* Modals outside blurred content */}
      {showBuildModal && (
        <BuildModal
          open={showBuildModal}
          onClose={() => setShowBuildModal(false)}
          onBuildStart={handleBuildStart}
          appId={appId}
          appDetails={appDetails}
        />
      )}
      {showDeployModal && (
        <DeployModal
          open={showDeployModal}
          onOpenChange={setShowDeployModal}
          buildHistory={buildHistory}
          selectedBuild={selectedBuild}
          setSelectedBuild={setSelectedBuild}
          deployError={deployError}
          handleDeploy={handleDeploy}
          deployLoading={deployLoading}
        />
      )}
    </div>
  );
};

export default BuildHistoryPage;
