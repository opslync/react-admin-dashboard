import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, putMethod } from '../../library/api';
import { API_BASE_URL } from '../../library/constant';
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
  Dialog,
  DialogContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Terminal, Play, RotateCw, Code2, GitBranch, Clock, Activity, Database, Layers } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { PodShell } from '../../components/app-detail/PodShell';

const AppDetailPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const location = useLocation();
  const [appDetails, setAppDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [isShellOpen, setIsShellOpen] = useState(false);
  const [pods, setPods] = useState([]);
  const [logs, setLogs] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);

  const connectToLogs = (podName, container) => {
    if (wsConnection) {
      wsConnection.close();
    }

    const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws').replace(/\/?$/, '/');
    const ws = new WebSocket(`${wsBaseUrl}app/${appId}/pods/logs`);
    
    console.log('Connecting to WebSocket:', `${wsBaseUrl}app/${appId}/pods/logs`);
    
    ws.onopen = () => {
      console.log('WebSocket Connected, sending initial request');
      const request = {
        pod_name: podName,
        container: 'opslync-chart',
        tail_lines: 100,
        follow: true
      };
      console.log('Sending request:', request);
      ws.send(JSON.stringify(request));
      
      setLogs(prev => [...prev, 'Connected to logs...']);
    };

    ws.onmessage = (event) => {
      try {
        console.log('Received message:', event.data);
        const logData = JSON.parse(event.data);
        if (logData.content) {
          setLogs(prev => [...prev, logData.content]);
        } else if (typeof logData === 'string') {
          setLogs(prev => [...prev, logData]);
        }
      } catch (error) {
        console.error('Error parsing log message:', error);
        setLogs(prev => [...prev, event.data]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setLogs(prev => [...prev, 'Error connecting to logs']);
    };

    ws.onclose = (event) => {
      console.log('WebSocket Disconnected:', event.code, event.reason);
      setLogs(prev => [...prev, 'Connection closed']);
    };

    setWsConnection(ws);
  };

  useEffect(() => {
    fetchAppDetails();
    fetchPodStatus();
    
    const statusInterval = setInterval(fetchPodStatus, 10000);

    return () => {
      clearInterval(statusInterval);
      if (wsConnection) {
        wsConnection.close();
      }
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
      
      if (response.data && response.data.length > 0) {
        const pod = response.data[0];
        console.log('Pod details:', pod);
        if (pod.name) {
          connectToLogs(pod.name, 'opslync-chart');
        }
      }
    } catch (err) {
      console.error('Failed to fetch pod status:', err);
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

  const handleOpenShell = () => setIsShellOpen(true);
  const handleCloseShell = () => setIsShellOpen(false);

  const handleStartApp = async () => {
    try {
      await putMethod(`app/${appId}/start`);
      fetchPodStatus();
    } catch (err) {
      setError('Failed to start application');
    }
  };

  const handleRebuildDeploy = async () => {
    try {
      await putMethod(`app/${appId}/rebuild`);
      fetchPodStatus();
    } catch (err) {
      setError('Failed to rebuild and deploy');
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

  const getUptime = () => {
    if (!appDetails?.startTime) return 'N/A';
    return moment(appDetails.startTime).fromNow(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <CircularProgress />
    </div>
  );

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      {/* App Name Header with Status */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-semibold">{appDetails?.name}</h1>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(pods[0]?.status)} ${
            pods[0]?.status === 'Running' ? 'animate-pulse' : ''
          }`} />
          <span className="text-sm font-medium">{pods[0]?.status || 'Unknown'}</span>
        </div>
      </div>

      {/* Back Button and Description */}
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
          {/* <Tab 
            icon={<div className="mr-2">📊</div>} 
            label="Deployment History" 
            iconPosition="start"
          /> */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Status Card */}
          <Card className="overflow-visible">
            <CardContent>
              <Typography variant="h6" className="mb-4">Application Status</Typography>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Activity className="w-5 h-5 text-gray-600" />
                    <div className={`absolute -right-1 -top-1 w-3 h-3 rounded-full ${getStatusColor(pods[0]?.status)} ${
                      pods[0]?.status === 'Running' ? 'animate-pulse' : ''
                    }`} />
                  </div>
                  <div>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Typography variant="body1" className="font-medium">
                      {pods[0]?.status || 'Unknown'}
                    </Typography>
                  </div>
                </div>

                {/* Uptime */}
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Uptime</Typography>
                    <Typography variant="body1" className="font-medium">
                      {getUptime()}
                    </Typography>
                  </div>
                </div>

                {/* Latest Commit */}
                <div className="flex items-center gap-3">
                  <GitBranch className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Latest Commit</Typography>
                    <Typography variant="body1" className="font-medium font-mono">
                      {appDetails?.commit?.slice(0, 7) || 'N/A'}
                    </Typography>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Database</Typography>
                    <Typography variant="body1" className="font-medium">
                      {appDetails?.database || 'Not configured'}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Build Pack</Typography>
                    <Typography variant="body1" className="font-medium">
                      {appDetails?.buildPack || 'Dockerfile'}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Port</Typography>
                    <Typography variant="body1" className="font-medium">
                      {appDetails?.port || '3000'}
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Logs */}
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h6">Application Logs</Typography>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setLogs([]);
                    if (pods.length > 0) {
                      const pod = pods[0];
                      connectToLogs(pod.name, pod.containers[0]);
                    }
                  }}
                >
                  Refresh Logs
                </Button>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 h-[300px] overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No logs available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Right Column */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Quick Actions</Typography>
              <div className="space-y-3">
                {pods[0]?.status === 'Running' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleOpenShell}
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Open Shell
                  </Button>
                )}
                
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleStartApp}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Application
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRebuildDeploy}
                >
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rebuild & Deploy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resource Usage */}
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Resource Usage</Typography>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">CPU Usage</Typography>
                    <Typography variant="body2">30%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">Memory Usage</Typography>
                    <Typography variant="body2">45%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">Storage Usage</Typography>
                    <Typography variant="body2">15%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Shell Modal */}
      <Dialog
        open={isShellOpen}
        onClose={handleCloseShell}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#1e1e1e',
            borderRadius: '12px',
          }
        }}
      >
        <div className="flex justify-between items-center bg-gray-800 px-4 py-3">
          <Typography className="text-gray-200 font-medium flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Terminal Session
          </Typography>
          <IconButton 
            onClick={handleCloseShell}
            className="text-gray-400 hover:text-gray-200"
            size="small"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        <DialogContent className="p-0">
          {pods.length > 0 && (
            <PodShell
              podDetails={{
                namespace: pods[0].Namespace,
                podName: pods[0].name,
                container: pods[0].containers[0]
              }}
              appId={appId}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppDetailPage;