import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    IconButton,
    CircularProgress
} from '@mui/material';
import { Terminal as TerminalIcon, Close as CloseIcon } from '@mui/icons-material';
import { PodShell } from './PodShell';
import { usePodList } from '../../hooks/usePodList';

const NAMESPACES = [
    'default',
    'kube-system',
    'argo',
    'monitoring'
];

export const PodShellInterface = ({ podDetails }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [selectedNamespace, setSelectedNamespace] = useState(podDetails?.namespace || 'default');
    const [selectedPod, setSelectedPod] = useState(podDetails?.podName || '');
    const [selectedContainer, setSelectedContainer] = useState('');
    const { pods, loading: podsLoading, error: podsError } = usePodList(selectedNamespace);

    // Reset pod selection when namespace changes
    useEffect(() => {
        setSelectedPod('');
        setSelectedContainer('');
    }, [selectedNamespace]);

    // Update container when pod selection changes
    useEffect(() => {
        if (selectedPod && pods.length > 0) {
            const pod = pods.find(p => p.name === selectedPod);
            if (pod?.containers?.length > 0) {
                setSelectedContainer(pod.containers[0].name);
            } else {
                setSelectedContainer('');
            }
        }
    }, [selectedPod, pods]);

    const getContainersForPod = () => {
        const pod = pods.find(p => p.name === selectedPod);
        return pod?.containers || [];
    };

    const handleConnect = () => {
        if (selectedNamespace && selectedPod && selectedContainer) {
            setIsConnected(true);
        }
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    return (
        <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TerminalIcon />
                    <Typography variant="h6">Pod Shell Access</Typography>
                </Box>
                {isConnected && (
                    <IconButton onClick={handleDisconnect} color="error" size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </Box>

            {!isConnected ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Namespace</InputLabel>
                        <Select
                            value={selectedNamespace}
                            label="Namespace"
                            onChange={(e) => setSelectedNamespace(e.target.value)}
                        >
                            {NAMESPACES.map(namespace => (
                                <MenuItem key={namespace} value={namespace}>
                                    {namespace}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Pod</InputLabel>
                        <Select
                            value={selectedPod}
                            label="Pod"
                            onChange={(e) => setSelectedPod(e.target.value)}
                            disabled={podsLoading || pods.length === 0}
                        >
                            {podsLoading ? (
                                <MenuItem value="">
                                    <CircularProgress size={20} /> Loading pods...
                                </MenuItem>
                            ) : pods.length === 0 ? (
                                <MenuItem value="" disabled>No pods found</MenuItem>
                            ) : (
                                pods.map(pod => (
                                    <MenuItem key={pod.name} value={pod.name}>
                                        {pod.name} ({pod.status})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Container</InputLabel>
                        <Select
                            value={selectedContainer}
                            label="Container"
                            onChange={(e) => setSelectedContainer(e.target.value)}
                            disabled={!selectedPod || getContainersForPod().length === 0}
                        >
                            {getContainersForPod().map(container => (
                                <MenuItem key={container.name} value={container.name}>
                                    {container.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        onClick={handleConnect}
                        disabled={!selectedNamespace || !selectedPod || !selectedContainer || podsLoading}
                        startIcon={<TerminalIcon />}
                        sx={{ mt: 2 }}
                    >
                        Connect to Pod Shell
                    </Button>

                    {podsError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {podsError}
                        </Alert>
                    )}

                    {!podsError && pods.length === 0 && !podsLoading && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No pods found in the selected namespace.
                        </Alert>
                    )}
                </Box>
            ) : (
                <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Connected to pod: {selectedPod} ({selectedContainer})
                    </Alert>
                    <PodShell
                        podDetails={{
                            namespace: selectedNamespace,
                            podName: selectedPod,
                            container: selectedContainer
                        }}
                    />
                </Box>
            )}
        </Paper>
    );
};