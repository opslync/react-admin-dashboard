import { useState, useEffect } from 'react';
import { getMethod } from '../library/api';

export const useDeployments = () => {
    const [deployments, setDeployments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeploymentHistory = async () => {
            try {
                const response = await getMethod('deployments');
                setDeployments(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch deployment history. Please try again.');
                setLoading(false);
            }
        };

        fetchDeploymentHistory();
    }, []);

    return { deployments, loading, error };
};