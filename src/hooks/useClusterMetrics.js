import { useState, useEffect } from 'react';

export const useClusterMetrics = () => {
  const [clusterMetrics, setClusterMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${process.env.REACT_APP_WS_BASE_URL}/api/cluster/metrics/stream?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setClusterMetrics(data);
      } catch (err) {
        setError('Failed to parse cluster metrics');
        console.error('Failed to parse cluster metrics:', err);
      }
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error occurred:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => ws.close();
  }, []);

  return { clusterMetrics, error };
};