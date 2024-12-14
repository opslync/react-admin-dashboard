import { useState, useEffect } from 'react';
import { getMethod } from '../library/api';

export const useAppDeployments = (appId) => {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const response = await getMethod(`app/${appId}/deployments`);
                setDeployments(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch deployment history. Please try again.');
                setLoading(false);
            }
        };

        fetchDeployments();
    }, [appId]);

    return { deployments, loading, error };
};