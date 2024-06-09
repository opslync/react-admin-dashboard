import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import { getMethod, postMethod, putMethod } from '../library/api';

const AppDetailPage = () => {
  const { appId } = useParams();
  const history = useHistory();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedRepoUrl, setUpdatedRepoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [buildId, setBuildId] = useState(null);
  const [showLogs, setShowLogs] = useState(false); // State to manage log visibility
  const ws = useRef(null);
  const isMounted = useRef(false); // To track if the component is mounted

  useEffect(() => {
    // Fetch app details
    const fetchAppDetails = async () => {
      try {
        const response = await getMethod(`app/${appId}`);
        setApp(response.data);
        setUpdatedName(response.data.name);
        setUpdatedRepoUrl(response.data.repoUrl);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch app details. Please try again.');
        setLoading(false);
      }
    };

    fetchAppDetails();
    return () => {
      isMounted.current = false; // Set to false when component unmounts
    };
  }, [appId]);

  useEffect(() => {
    if (buildId) {
      ws.current = new WebSocket(`ws://localhost:8080/api/app/ws/${buildId}`);

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
      };

      ws.current.onmessage = (event) => {
        setLogs((prevLogs) => [...prevLogs, event.data]);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
      };

      return () => {
        if (ws.current) {
          ws.current.close();
        }
      };
    }
  }, [buildId]);

  const handleBuild = async () => {
    try {
      console.log('Building app...');
      const response = await postMethod('app/build', { repoUrl: app.repoUrl });
      setBuildId(response.data.buildId);
      console.log('Build response:', response.data);
      // Handle success, show notification, etc.
    } catch (error) {
      console.error('Failed to build app:', error);
      setError('Failed to build app. Please try again.');
    }
  };

  const handleDeploy = async () => {
    try {
      // Implement deploy functionality here
      console.log('Deploying app...');
      // Add your deploy API call here
    } catch (error) {
      console.error('Failed to deploy app:', error);
      setError('Failed to deploy app. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      const response = await putMethod(`app/${appId}`, {
        name: updatedName,
        repoUrl: updatedRepoUrl
      });
      setApp(response.data);
      setIsEditing(false);
      console.log('App updated:', response.data);
    } catch (error) {
      console.error('Failed to update app:', error);
      setError('Failed to update app. Please try again.');
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleBack = () => {
    history.goBack();
  };

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center mb-4">
      <button onClick={handleBack} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mb-8 self-start hover:bg-gray-400">
        Back to Apps
      </button>
      {app && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-4">{isEditing ? 'Edit App' : app.name}</h1>
          {isEditing ? (
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">App Name</label>
                <input
                  type="text"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repository URL</label>
                <input
                  type="text"
                  value={updatedRepoUrl}
                  onChange={(e) => setUpdatedRepoUrl(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="flex space-x-4">
                <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Save
                </button>
                <button onClick={toggleEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-700">{app.description}</p>
              <p className="mb-4 text-gray-700">{app.repoUrl}</p>
              <div className="flex space-x-4">
                <button onClick={handleBuild} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Build
                </button>
                <button onClick={handleDeploy} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Deploy
                </button>
                <button onClick={toggleEdit} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  Edit
                </button>
              </div>
              {buildId && (
                <div className="mt-6">
                  <button onClick={toggleLogs} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4">
                    {showLogs ? 'Hide Logs' : 'Show Logs'}
                  </button>
                  {showLogs && (
                    <div className="bg-black text-white p-4 rounded-lg h-64 overflow-y-scroll">
                      {logs.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap">{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AppDetailPage;
