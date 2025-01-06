import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Button } from '@mui/material';
import { PodShell } from '../../components/app-detail/PodShell';
import { getMethod } from '../../library/api';
import { Terminal } from 'lucide-react';

const PodShellPage = () => {
  const { appId } = useParams();
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPod, setSelectedPod] = useState(null);
  const [showShell, setShowShell] = useState(false);

  useEffect(() => {
    const fetchPods = async () => {
      try {
        const response = await getMethod(`app/${appId}/pod/list`);
        setPods(response.data);
      } catch (err) {
        console.error('Failed to fetch pods:', err);
        setError('Failed to fetch pods. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPods();
  }, [appId]);

  const handlePodSelect = (e) => {
    const pod = pods.find(p => p.name === e.target.value);
    setSelectedPod(pod);
    setShowShell(false); // Reset shell visibility when selecting new pod
  };

  const handleConnectClick = () => {
    setShowShell(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        {error}
      </div>
    );
  }

  if (pods.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        No pods found for this application.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pod Shell</h1>
        <p className="text-gray-600">Access and interact with your application pods</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pod
          </label>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <select
                value={selectedPod?.name || ''}
                onChange={handlePodSelect}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a pod</option>
                {pods.map((pod) => (
                  <option key={pod.name} value={pod.name}>
                    {pod.name} ({pod.status})
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedPod}
              onClick={handleConnectClick}
              startIcon={<Terminal className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Connect to Shell
            </Button>
          </div>
        </div>

        {selectedPod && showShell && (
          <div className="border rounded-lg overflow-hidden mt-4">
            <PodShell 
              podDetails={{
                namespace: selectedPod.Namespace,
                podName: selectedPod.name,
                container: selectedPod.containers[0]
              }} 
              appId={appId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PodShellPage; 