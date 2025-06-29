import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, putMethod, postMethod } from '../../library/api';
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
import { Terminal, Play, RotateCw, Code2, GitBranch, Clock, Activity, Database, Layers, ChevronDown, ChevronUp, Search, Download, Trash2, Pause, Play as PlayIcon, RotateCcw, Filter } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { PodShell } from '../../components/app-detail/PodShell';
import { formatUptime, formatCommitHash, formatCommitMessage, formatTimeAgo } from '../../utils/formatters';
import githubTokenManager from '../../utils/githubTokenManager';

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
  const [showLogs, setShowLogs] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [logSearch, setLogSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const logsEndRef = useRef(null);
  const [latestCommit, setLatestCommit] = useState(null);
  const [loadingCommit, setLoadingCommit] = useState(false);
  const [resourceMetrics, setResourceMetrics] = useState({
    cpu: 0,
    memory: 0,
    storage: 0
  });
  const [metricsWsConnection, setMetricsWsConnection] = useState(null);

  const detectLogLevel = (message) => {
    if (!message || typeof message !== 'string') return 'info';
    const msg = message.toLowerCase();
    if (msg.includes('error') || msg.includes('failed') || msg.includes('exception')) return 'error';
    if (msg.includes('warn') || msg.includes('warning')) return 'warning';
    if (msg.includes('success') || msg.includes('completed') || msg.includes('done')) return 'success';
    if (msg.includes('info') || msg.includes('starting') || msg.includes('connected')) return 'info';
    return 'info';
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const getLogLevelBg = (level) => {
    switch (level) {
      case 'error': return 'bg-red-900/20';
      case 'warning': return 'bg-yellow-900/20';
      case 'success': return 'bg-green-900/20';
      case 'info': return 'bg-blue-900/20';
      default: return '';
    }
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => {
      const timestamp = log.timestamp || new Date().toLocaleTimeString();
      const level = (log.level || 'info').toUpperCase();
      const message = log.message || '';
      return `[${timestamp}] [${level}] ${message}`;
    }).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appDetails?.name || 'app'}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => {
    const message = log.message || '';
    const level = log.level || 'info';
    const matchesSearch = logSearch === '' || 
      message.toLowerCase().includes(logSearch.toLowerCase());
    const matchesLevel = logLevelFilter === 'all' || level === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  const connectToLogs = (podName, container) => {
    if (wsConnection) {
      wsConnection.close();
    }

    const wsBaseUrl = API_BASE_URL.replace(/^http/, 'ws').replace(/\/?$/, '/');
    const token = localStorage.getItem('token');
    const wsUrl = `${wsBaseUrl}app/${appId}/pods/logs?token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    ws.onopen = () => {
      console.group('🟢 WebSocket Connection Opened');
      console.log('🕒 Connection Time:', new Date().toISOString());
      console.log('🔌 WebSocket URL:', ws.url);
      console.log('⚙️ WebSocket State:', ws.readyState);
      console.log('📱 App ID:', appId);
      console.log('🏷️ Pod Name:', podName);
      console.log('📦 Container:', 'opslync-chart');
      
      const request = {
        pod_name: podName,
        container: 'opslync-chart',
        tail_lines: 100,
        follow: true
      };
      
      console.log('📤 Sending Initial Request:', request);
      console.log('📤 Request JSON:', JSON.stringify(request));
      
      ws.send(JSON.stringify(request));
      setLogs(prev => [...prev, 'Connected to logs...']);
      
      console.log('✅ Initial request sent successfully');
      console.groupEnd();
    };

    ws.onmessage = (event) => {
      // 🔍 TESTING: Enhanced console logging for WebSocket data
      console.group('📨 WebSocket Log Data Received');
      console.log('🕒 Timestamp:', new Date().toISOString());
      console.log('📦 Raw Event Data:', event.data);
      console.log('📏 Data Length:', event.data.length);
      console.log('🔤 Data Type:', typeof event.data);
      console.log('⚙️ WebSocket State:', ws.readyState);
      console.log('⏸️ Is Paused:', isLogsPaused);
      
      if (isLogsPaused) {
        console.log('⏸️ SKIPPED: Logs are paused, ignoring message');
        console.groupEnd();
        return;
      }
      
      let content;
      let logFormat = 'unknown';
      
      try {
        // First, check if it looks like JSON by examining the string structure
        const trimmedData = event.data.trim();
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
          // Looks like JSON, try to parse it
          const logData = JSON.parse(event.data);
          console.log('✅ Successfully parsed JSON:', logData);
          console.log('🏷️ Available JSON Fields:', Object.keys(logData));
          
          // Extract content from various possible field names with proper fallbacks
          content = logData.content || logData.message || logData.log || logData.text || String(event.data || '');
          logFormat = 'JSON';
          
          // Log the structure analysis
          if (typeof logData === 'object') {
            console.log('📋 Data Structure Analysis:');
            Object.keys(logData).forEach(key => {
              console.log(`  - ${key}:`, typeof logData[key], logData[key]);
            });
          }
        } else {
          // Doesn't look like JSON, treat as plain text
          console.log('📝 Detected plain text format (no JSON structure)');
          content = String(event.data || '');
          logFormat = 'Plain Text';
        }
      } catch (error) {
        // JSON parsing failed, fallback to plain text
        console.log('❌ JSON parse failed, using plain text fallback:', error.message);
        content = String(event.data || '');
        logFormat = 'Plain Text (fallback)';
      }
      
      console.log('📄 Final Content:', content);
      console.log('🔧 Detected Format:', logFormat);
      console.log('📏 Content Length:', content ? content.length : 0);
      
      // Skip empty content
      if (!content || content.trim() === '') {
        console.log('⚠️ SKIPPED: Empty content');
        console.groupEnd();
        return;
      }
      
      // Detect log level
      const detectedLevel = detectLogLevel(content);
      console.log('🎯 Detected Level:', detectedLevel);
      
      const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        message: content,
        level: detectedLevel,
        rawContent: content,
        format: logFormat // For debugging
      };
      
      console.log('📋 Created Log Entry:', logEntry);
      
      setLogs(prev => {
        const newLogs = [...prev, logEntry];
        console.log('📊 Logs count:', prev.length, '→', newLogs.length);
        console.log('📝 Recent log levels:', newLogs.slice(-3).map(log => {
          const level = log.level || 'unknown';
          const message = log.message || '';
          const preview = message.length > 30 ? message.substring(0, 30) + '...' : message;
          return `${level}:${preview}`;
        }));
        return newLogs;
      });
      
      console.log('✅ Log entry added successfully');
      console.groupEnd();
    };

    ws.onerror = (error) => {
      console.group('🔴 WebSocket Error');
      console.log('🕒 Error Time:', new Date().toISOString());
      console.log('❌ Error Object:', error);
      console.log('🔌 WebSocket URL:', ws.url);
      console.log('⚙️ WebSocket State:', ws.readyState);
      console.log('📱 App ID:', appId);
      console.log('🏷️ Error Type:', error.type);
      console.log('📄 Error Message:', error.message || 'No message available');
      console.groupEnd();
      
      setLogs(prev => [...prev, 'Error connecting to logs']);
    };

    ws.onclose = (event) => {
      console.group('🟡 WebSocket Connection Closed');
      console.log('🕒 Close Time:', new Date().toISOString());
      console.log('🔢 Close Code:', event.code);
      console.log('📄 Close Reason:', event.reason || 'No reason provided');
      console.log('✅ Was Clean Close:', event.wasClean);
      console.log('🔌 WebSocket URL:', ws.url);
      console.log('⚙️ Final WebSocket State:', ws.readyState);
      console.log('📱 App ID:', appId);
      
      // Standard close codes reference
      const closeCodes = {
        1000: 'Normal Closure',
        1001: 'Going Away',
        1002: 'Protocol Error',
        1003: 'Unsupported Data',
        1006: 'Abnormal Closure',
        1007: 'Invalid frame payload data',
        1008: 'Policy Violation',
        1009: 'Message too big',
        1010: 'Missing Extension',
        1011: 'Internal Error',
        1015: 'TLS Handshake'
      };
      
      console.log('📋 Close Code Meaning:', closeCodes[event.code] || 'Unknown');
      console.groupEnd();
      
      setLogs(prev => [...prev, 'Connection closed']);
    };

    setWsConnection(ws);
  };

  const shouldPollStatus = (status) => {
    const pollingStates = ['pending', 'containerCreating', 'waiting'];
    return pollingStates.includes(status?.toLowerCase());
  };

  const fetchPodStatus = async () => {
    try {
      const response = await getMethod(`app/${appId}/pod/list`);
      setPods(response.data);
      
      // Check if we should continue polling based on pod status
      const podStatus = response.data[0]?.status?.toLowerCase();
      if (!shouldPollStatus(podStatus)) {
        // Stop polling if we reach a final state
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
      
      if (response.data && response.data.length > 0) {
        const pod = response.data[0];
        console.log('Pod details:', pod);
        if (pod.name && !wsConnection) {
          connectToLogs(pod.name, 'opslync-chart');
        }
      }
    } catch (err) {
      console.error('Failed to fetch pod status:', err);
      // Stop polling on error
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  };

  useEffect(() => {
    fetchAppDetails();
    fetchPodStatus();
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [appId]);

  // Fetch latest commit when appDetails is available
  useEffect(() => {
    if (appDetails && appDetails.repoUrl) {
      fetchLatestCommit();
    }
  }, [appDetails]);

  // Setup metrics WebSocket when pods are available
  useEffect(() => {
    if (pods.length > 0 && pods[0]?.status === 'Running') {
      setupMetricsWebSocket();
    }
    
    return () => {
      if (metricsWsConnection) {
        metricsWsConnection.close();
      }
    };
  }, [pods]);

  // Start polling when pod status changes to a state that needs polling
  useEffect(() => {
    const podStatus = pods[0]?.status?.toLowerCase();
    
    if (shouldPollStatus(podStatus) && !pollingInterval) {
      const interval = setInterval(fetchPodStatus, 10000);
      setPollingInterval(interval);
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pods[0]?.status]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const paths = [
      `/app/${appId}/details`,
      `/app/${appId}/build-history`,
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
    if (pods && pods.length > 0 && pods[0].uptime) {
      return formatUptime(pods[0].uptime);
    }
    return 'N/A';
  };

  const fetchLatestCommit = async () => {
    if (!appDetails?.repoUrl || loadingCommit) return;
    
    setLoadingCommit(true);
    try {
      // Try to get GitHub token
      const githubToken = await githubTokenManager.waitForToken(2000);
      if (!githubToken) {
        console.log('No GitHub token available for commit fetching');
        return;
      }

      const repoUrl = appDetails.repoUrl.replace(/\.git$/, '');
      const payload = {
        github_token: githubToken,
        repo_url: repoUrl,
        branch: appDetails.branch || 'main'
      };

      const response = await postMethod('api/user/github/commits', payload);
      if (response.data && response.data.length > 0) {
        setLatestCommit(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch latest commit:', error);
      // Try to get from build history as fallback
      try {
        const buildsResponse = await getMethod(`app/${appId}/workflows/builds`);
        if (buildsResponse.data && buildsResponse.data.length > 0) {
          const latestBuild = buildsResponse.data[0];
          setLatestCommit({
            hash: latestBuild.commitId,
            message: latestBuild.commitMessage,
            date: formatTimeAgo(latestBuild.startTime),
            author: 'Unknown'
          });
        }
      } catch (buildError) {
        console.error('Failed to fetch from build history:', buildError);
      }
    } finally {
      setLoadingCommit(false);
    }
  };

  const getLatestCommitDisplay = () => {
    if (loadingCommit) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      );
    }

    if (latestCommit) {
      return (
        <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
          {formatCommitHash(latestCommit.hash)}
        </code>
      );
    }

    return appDetails?.lastCommit || 'N/A';
  };

  const setupMetricsWebSocket = () => {
    if (metricsWsConnection) {
      metricsWsConnection.close();
    }

    const namespace = 'argo'; // or get from pod details
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8080/api/pods/metrics/stream?namespace=${namespace}&token=${token}`);

    ws.onopen = () => {
      console.log('📊 Metrics WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const trimmedData = event.data.trim();
        if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
          const data = JSON.parse(event.data);
          
          if (data.pods && data.pods.length > 0) {
            // Find metrics for current app's pod
            const currentPod = data.pods.find(pod => 
              pods[0] && pod.name && pod.name.includes(pods[0].name?.split('-')[0])
            );
            
            if (currentPod) {
              setResourceMetrics({
                cpu: Math.min(100, Math.max(0, parseFloat(currentPod.cpu || 0))),
                memory: Math.min(100, Math.max(0, parseFloat(currentPod.memory || 0))),
                storage: Math.min(100, Math.max(0, parseFloat(currentPod.storage || 0)))
              });
            } else {
              // Use mock data if no specific pod found
              setResourceMetrics({
                cpu: Math.floor(Math.random() * 60) + 10,
                memory: Math.floor(Math.random() * 70) + 20,
                storage: Math.floor(Math.random() * 40) + 5
              });
            }
          }
        } else {
          // Handle plain text messages
          console.log('📝 Metrics connection message:', event.data);
        }
      } catch (error) {
        console.log('📊 Metrics WebSocket message processing:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('📊 Metrics WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('📊 Metrics WebSocket closed');
    };

    setMetricsWsConnection(ws);
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
                  <Activity className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Typography variant="body1" className="font-medium">
                      {pods[0]?.status || 'Not Deployed'}
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
                    <Typography variant="body1" className="font-medium">
                      {getLatestCommitDisplay()}
                    </Typography>
                  </div>
                </div>

                {/* Database */}
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Database</Typography>
                    <Typography variant="body1" className="font-medium">
                      Not configured
                    </Typography>
                  </div>
                </div>

                {/* Build Pack */}
                <div className="flex items-center gap-3">
                  <Code2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <Typography variant="body2" color="textSecondary">Build Pack</Typography>
                    <Typography variant="body1" className="font-medium">
                      {appDetails?.buildPack || 'Dockerfile'}
                    </Typography>
                  </div>
                </div>

                {/* Port */}
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

          {/* Enhanced Application Logs */}
          {pods[0]?.status === 'Running' && (
            <Card>
              <CardContent>
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowLogs(!showLogs)}
                >
                  <Typography variant="h6" className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Application Logs
                    {logs.length > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {filteredLogs.length}/{logs.length}
                      </span>
                    )}
                  </Typography>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {showLogs ? (
                      <>
                        Hide Logs
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View Logs
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {showLogs && (
                  <>
                    {/* Log Controls */}
                    <div className="flex flex-wrap gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
                      {/* Search */}
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search logs..."
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>

                      {/* Log Level Filter */}
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <Select value={logLevelFilter} onValueChange={setLogLevelFilter}>
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLogsPaused(!isLogsPaused)}
                          className="h-8"
                        >
                          {isLogsPaused ? (
                            <PlayIcon className="w-4 h-4" />
                          ) : (
                            <Pause className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAutoScroll(!autoScroll)}
                          className={`h-8 ${autoScroll ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadLogs}
                          disabled={logs.length === 0}
                          className="h-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearLogs}
                          disabled={logs.length === 0}
                          className="h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

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
                          className="h-8"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Log Display */}
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-[400px] overflow-y-auto mt-4 relative">
                      {filteredLogs.length > 0 ? (
                        <>
                          {filteredLogs.map((log) => (
                            <div 
                              key={log.id} 
                              className={`flex gap-3 py-1 px-2 rounded mb-1 hover:bg-gray-800/50 ${getLogLevelBg(log.level)}`}
                            >
                              <span className="text-gray-500 text-xs min-w-[80px]">
                                {log.timestamp}
                              </span>
                              <span className={`text-xs font-bold min-w-[60px] uppercase ${getLogLevelColor(log.level)}`}>
                                {log.level}
                              </span>
                              <span className="text-gray-300 whitespace-pre-wrap flex-1">
                                {log.message}
                              </span>
                            </div>
                          ))}
                          <div ref={logsEndRef} />
                        </>
                      ) : logs.length > 0 ? (
                        <div className="text-gray-500 text-center py-8">
                          No logs match the current filters
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setLogSearch('');
                                setLogLevelFilter('all');
                              }}
                              className="text-xs"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          No logs available
                          <div className="text-xs mt-1">
                            {isLogsPaused ? 'Logs are paused' : 'Waiting for log data...'}
                          </div>
                        </div>
                      )}

                      {/* Status indicators */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {isLogsPaused && (
                          <span className="bg-yellow-900/50 text-yellow-300 text-xs px-2 py-1 rounded">
                            PAUSED
                          </span>
                        )}
                        {autoScroll && (
                          <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-1 rounded">
                            AUTO-SCROLL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Log Stats */}
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <div className="flex gap-4">
                        <span>Total: {logs.length}</span>
                        <span>Filtered: {filteredLogs.length}</span>
                        {logs.length > 0 && (
                          <span>
                            Errors: {logs.filter(l => l.level === 'error').length} | 
                            Warnings: {logs.filter(l => l.level === 'warning').length}
                          </span>
                        )}
                      </div>
                      <div>
                        {wsConnection?.readyState === WebSocket.OPEN && (
                          <span className="text-green-600">● Connected</span>
                        )}
                        {wsConnection?.readyState === WebSocket.CONNECTING && (
                          <span className="text-yellow-600">● Connecting</span>
                        )}
                        {wsConnection?.readyState === WebSocket.CLOSED && (
                          <span className="text-red-600">● Disconnected</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
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
                    <Typography variant="body2">{resourceMetrics.cpu.toFixed(1)}%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${resourceMetrics.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">Memory Usage</Typography>
                    <Typography variant="body2">{resourceMetrics.memory.toFixed(1)}%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${resourceMetrics.memory}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <Typography variant="body2" color="textSecondary">Storage Usage</Typography>
                    <Typography variant="body2">{resourceMetrics.storage.toFixed(1)}%</Typography>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${resourceMetrics.storage}%` }}
                    ></div>
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