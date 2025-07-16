import { useState, useEffect } from 'react';
import { getMethod } from '../library/api';

const CACHE_DURATION = 300000; // 5 minutes

export const usePodStatus = (appId, deployments) => {
    const [statusMap, setStatusMap] = useState({});

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const cachedStatus = localStorage.getItem(`podStatus-${appId}`);
                const now = new Date();

                if (cachedStatus) {
                    const parsedCache = JSON.parse(cachedStatus);
                    if (now - new Date(parsedCache.timestamp) < CACHE_DURATION) {
                        setStatusMap(parsedCache.data);
                        return;
                    }
                }

                const statusPromises = deployments.map(async (deployment) => {
                    const response = await getMethod(`app/${appId}/pod/status`);
                    return { releaseName: deployment.releaseName, status: response.data[0].status };
                });

                const statusResults = await Promise.all(statusPromises);
                const newStatusMap = statusResults.reduce((map, { releaseName, status }) => {
                    map[releaseName] = status;
                    return map;
                }, {});

                setStatusMap(newStatusMap);
                localStorage.setItem(`podStatus-${appId}`, JSON.stringify({
                    data: newStatusMap,
                    timestamp: new Date()
                }));
            } catch (err) {
                console.error('Failed to fetch pod status:', err);
            }
        };

        if (deployments.length) {
            fetchStatus();
            const intervalId = setInterval(fetchStatus, CACHE_DURATION);
            return () => clearInterval(intervalId);
        }
    }, [deployments, appId]);

    return statusMap;
};