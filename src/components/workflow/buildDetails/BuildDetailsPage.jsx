import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import BuildHistoryList from './BuildHistoryList';
import BuildLogs from './BuildLogs';
import { useParams } from 'react-router-dom';
import { getMethod } from '../../../library/api';
import { API_BASE_URL } from '../../../library/constant';


export default function BuildDetailsPage({ onBack, workflowId: initialWorkflowId }) {
  const { appId } = useParams();
  const [buildHistory, setBuildHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialWorkflowId);

  useEffect(() => {
    fetchBuildHistory();
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
        message: 'Connected to build logs...',
        level: 'info'
      }]);
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
        message: 'Completed',
        level: 'info'
      }]);
    };

    setWsConnection(ws);
  };

  const fetchBuildHistory = async () => {
    try {
      const response = await getMethod(`app/${appId}/workflows/builds`);
      setBuildHistory(response.data.map(build => ({
        id: build.workflowID,
        commitHash: build.commitId,
        commitMessage: build.commitMessage,
        startTime: new Date(build.startTime).toLocaleString(),
        status: build.workflowID === selectedWorkflowId ? 'running' : 'completed'
      })));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 ml-64">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading build history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 ml-64">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 ml-64">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Build Details</h1>
          </div>
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
    </div>
  );
} 