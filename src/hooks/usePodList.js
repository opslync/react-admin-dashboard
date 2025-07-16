import { useState, useEffect } from 'react';
import { getMethod } from '../library/api';

export const usePodList = (namespace) => {
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPods = async () => {
            try {
                setLoading(true);
                const response = await getMethod(`cluster/pod/list?namespace=${namespace}`);
                // Ensure we're properly transforming the response data
                const podList = Array.isArray(response.data) ? response.data : [];
                // Transform the data to match our expected format
                const transformedPods = podList.map(pod => ({
                    name: pod.name || pod.metadata?.name,
                    containers: pod.containers || pod.spec?.containers || [],
                    // status: pod.status?.phase || 'Unknown'
                }));
                setPods(transformedPods);
            } catch (err) {
                setError('Failed to fetch pod list');
                console.error('Error fetching pods:', err);
            } finally {
                setLoading(false);
            }
        };

        if (namespace) {
            fetchPods();
        }
    }, [namespace]);

    return { pods, loading, error };
};