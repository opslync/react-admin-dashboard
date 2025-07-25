import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import {
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    IconButton,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getMethod, putMethod } from '../../library/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { toastMessage } from '../../library/store/toast';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../../components/ui/dialog";

const validateKeyValuePairs = (value) => {
    if (!value) return false;
    const lines = value.split('\n');
    return lines.every(line => {
        const parts = line.split(':');
        return parts.length === 2 && parts[0].trim() && parts[1].trim();
    });
};

const getTabIndexFromPath = (pathname, appId) => {
    if (pathname === `/app/${appId}/details`) return 0;
    if (pathname === `/app/${appId}/build-history`) return 1;
    if (pathname === `/app/${appId}/app-settings`) return 2;
    return 0;
};

const AppConfigurationPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [appDetails, setAppDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(getTabIndexFromPath(location.pathname, appId));
    const [configMap, setConfigMap] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('general');
    const [pods, setPods] = useState([]);
    const [resources, setResources] = useState({
        cpuRequest: '',
        cpuLimit: '',
        memoryRequest: '',
        memoryLimit: ''
    });
    const [resourceStats, setResourceStats] = useState({
        totalCpu: '',
        totalMemory: '',
        usedCpu: '',
        usedMemory: '',
        availableCpu: '',
        availableMemory: ''
    });
    const [configMapEntries, setConfigMapEntries] = useState([{ key: '', value: '' }]);
    const [resourceError, setResourceError] = useState({ cpu: '', memory: '' });
    const [resourceLoading, setResourceLoading] = useState(false);
    const [resourceSuccess, setResourceSuccess] = useState('');
    const [resourceUpdateError, setResourceUpdateError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const dispatch = useDispatch();
    const [pendingDomain, setPendingDomain] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [envVarsPasteText, setEnvVarsPasteText] = useState("");
    const [showPasteSection, setShowPasteSection] = useState(false);

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

    const sections = [
        { id: 'general', label: 'General Settings' },
        { id: 'resources', label: 'Resources' },
        { id: 'env', label: 'Environment Variables' },
        { id: 'domain', label: 'Domain Mapping' }
    ];

    useEffect(() => {
        fetchAppDetails();
        fetchConfigMap();
        fetchPodStatus();
        fetchResources();
        const statusInterval = setInterval(fetchPodStatus, 10000);

        // Update tabValue when location changes
        setTabValue(getTabIndexFromPath(location.pathname, appId));

        return () => {
            clearInterval(statusInterval);
        };
    }, [appId, location.pathname]);

    const fetchAppDetails = async () => {
        try {
            const response = await getMethod(`app/${appId}`);
            setAppDetails(response.data);
            // Set resources from backend if available
            // setResources(prev => ({
            //     ...prev,
            //     cpuRequest: response.data.cpuRequest || '',
            //     cpuLimit: response.data.cpuLimit || '',
            //     memoryRequest: response.data.memoryRequest || '',
            //     memoryLimit: response.data.memoryLimit || ''
            // }));
            // Set resource stats
            setResourceStats({
                totalCpu: response.data.totalCpu || '',
                totalMemory: response.data.totalMemory || '',
                usedCpu: response.data.usedCpu || '',
                usedMemory: response.data.usedMemory || '',
                availableCpu: response.data.availableCpu || '',
                availableMemory: response.data.availableMemory || ''
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch app details. Please try again.');
            setLoading(false);
        }
    };

    const fetchConfigMap = async () => {
        try {
            const response = await getMethod(`app/${appId}/configmap`);
            const entries = Object.entries(response.data).map(([key, value]) => ({ key, value }));
            setConfigMapEntries(entries.length ? entries : [{ key: '', value: '' }]);
        } catch (err) {
            setConfigMapEntries([{ key: '', value: '' }]);
        }
    };

    const fetchPodStatus = async () => {
        try {
            const response = await getMethod(`app/${appId}/pod/list`);
            setPods(response.data);
        } catch (err) {
            console.error('Failed to fetch pod status:', err);
        }
    };

    const fetchResources = async () => {
        setResourceLoading(true);
        setResourceUpdateError('');
        setResourceSuccess('');
        try {
            const response = await getMethod(`app/${appId}/resources`);
            if (response.data && response.data.data) {
                setResources({
                    cpuRequest: response.data.data.cpuRequest || '',
                    cpuLimit: response.data.data.cpuLimit || '',
                    memoryRequest: response.data.data.memoryRequest || '',
                    memoryLimit: response.data.data.memoryLimit || ''
                });
            }
        } catch (err) {
            setResourceUpdateError('Failed to fetch resources.');
        } finally {
            setResourceLoading(false);
        }
    };

    const handleResourceSave = async () => {
        setResourceLoading(true);
        setResourceUpdateError('');
        setResourceSuccess('');
        try {
            const response = await putMethod(`app/${appId}/resources`, resources);
            setResourceSuccess('Resources updated successfully.');
            // Optionally update local state with returned data
            if (response.data && response.data.data) {
                setResources({
                    cpuRequest: response.data.data.cpuRequest || '',
                    cpuLimit: response.data.data.cpuLimit || '',
                    memoryRequest: response.data.data.memoryRequest || '',
                    memoryLimit: response.data.data.memoryLimit || ''
                });
            }
        } catch (err) {
            setResourceUpdateError('Failed to update resources.');
        } finally {
            setResourceLoading(false);
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

    const formik = useFormik({
        initialValues: {
            name: appDetails?.name || '',
            description: appDetails?.description || '',
            buildPack: 'dockerfile',
            repoUrl: appDetails?.repoUrl || '',
            port: appDetails?.port || '3000',
            branch: appDetails?.branch || '',
            customDomain: appDetails?.domains && appDetails.domains.length > 0 ? appDetails.domains[0] : '',
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            port: Yup.number().required('Port is required').min(1).max(65535),
            customDomain: Yup.string()
                .matches(
                    /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.(?:[A-Za-z]{2,}|[A-Za-z0-9-]{2,}\.[A-Za-z]{2,})$/,
                    'Enter a valid domain (e.g. app.example.com)'
                )
                .nullable(),
        }),
        onSubmit: async (values) => {
            setIsSaving(true);
            try {
                // Update app details
                await putMethod(`app/${appId}`, {
                    name: values.name,
                    description: values.description,
                    buildPack: values.buildPack,
                    repoUrl: values.repoUrl,
                    port: values.port,
                    branch: values.branch,
                    // Only send customDomain if set
                    domains: values.customDomain ? [values.customDomain] : [],
                });

                // Update ConfigMap
                const configMapData = configMapEntries.reduce((acc, { key, value }) => {
                    if (key) acc[key] = value;
                    return acc;
                }, {});
                await putMethod(`app/${appId}/configmap`, configMapData);

                dispatch(toastMessage({
                    severity: 'success',
                    summary: 'Settings Updated',
                    detail: 'Settings updated successfully',
                }));
            } catch (err) {
                setError('Failed to update settings. Please try again.');
            } finally {
                setIsSaving(false);
            }
        },
    });

    // Validation for resource requests
    const validateResource = (type, value) => {
        let error = '';
        if (type === 'cpu') {
            if (resources.cpuLimit && value && parseCpu(value) > parseCpu(resources.cpuLimit)) {
                error = 'CPU request cannot exceed limit';
            }
        } else if (type === 'memory') {
            if (resources.memoryLimit && value && parseMemory(value) > parseMemory(resources.memoryLimit)) {
                error = 'Memory request cannot exceed limit';
            }
        }
        setResourceError(prev => ({ ...prev, [type]: error }));
    };

    // Parse CPU (e.g. 100m -> 0.1, 1 -> 1)
    function parseCpu(val) {
        if (!val) return 0;
        if (val.endsWith('m')) return parseFloat(val.replace('m', '')) / 1000;
        return parseFloat(val);
    }

    // Parse Memory (e.g. 128Mi -> 128, 1Gi -> 1024)
    function parseMemory(val) {
        if (!val) return 0;
        if (val.endsWith('Gi')) return parseFloat(val.replace('Gi', '')) * 1024;
        if (val.endsWith('Mi')) return parseFloat(val.replace('Mi', ''));
        return parseFloat(val);
    }

    // Validate environment variables format (key=value)
    const validateEnvVarFormat = (value) => {
        if (!value) return false;
        const lines = value.split('\n').filter(line => line.trim());
        return lines.every(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return true; // Skip empty lines
            const parts = trimmedLine.split('=');
            return parts.length >= 2 && parts[0].trim() && parts.slice(1).join('=').trim();
        });
    };

    // Parse pasted environment variables
    const parseEnvVars = () => {
        if (!envVarsPasteText.trim()) return;
        
        const lines = envVarsPasteText.trim().split('\n');
        const newEntries = [];
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes('=')) {
                const equalIndex = trimmedLine.indexOf('=');
                const key = trimmedLine.substring(0, equalIndex).trim();
                const value = trimmedLine.substring(equalIndex + 1).trim();
                
                if (key && value) {
                    newEntries.push({ key, value });
                }
            }
        });
        
        if (newEntries.length > 0) {
            // If configMapEntries only has one empty entry, replace it
            if (configMapEntries.length === 1 && !configMapEntries[0].key && !configMapEntries[0].value) {
                setConfigMapEntries(newEntries);
            } else {
                // Otherwise, append to existing entries
                setConfigMapEntries([...configMapEntries, ...newEntries]);
            }
            setEnvVarsPasteText("");
            dispatch(toastMessage({
                severity: 'success',
                summary: 'Variables Added',
                detail: `${newEntries.length} environment variable(s) added successfully`,
            }));
        }
    };


    if (loading) return <CircularProgress />;

    return (
        <>
            {/* DNS Configuration Dialog (rendered outside blurred content) */}
            {formik.values.customDomain && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="border border-gray-200 bg-white z-9999">
                        <DialogTitle>DNS configuration for {formik.values.customDomain}</DialogTitle>
                        <div className="mb-2 text-sm text-gray-700">
                            <strong>DNS configuration</strong>
                            <div className="mt-2">
                                <span className="font-semibold">Recommended:</span> Point <span className="font-mono">ALIAS</span>, <span className="font-mono">ANAME</span>, or flattened <span className="font-mono">CNAME</span> record to <span className="font-mono">apex-loadbalancer.netlify.com</span>.<br/>
                                <span className="block mt-1 bg-gray-100 rounded px-2 py-1 font-mono text-xs">{formik.values.customDomain} ALIAS apex-loadbalancer.netlify.com</span>
                            </div>
                            <div className="mt-3">
                                <span className="font-semibold">Fallback:</span> Point <span className="font-mono">A</span> record to <span className="font-mono">75.2.60.5</span>.<br/>
                                <span className="block mt-1 bg-gray-100 rounded px-2 py-1 font-mono text-xs">{formik.values.customDomain} A 75.2.60.5</span>
                            </div>
                            <div className="mt-4 text-yellow-700 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded text-xs">
                                <strong>Warning!</strong> With your current configuration, you may not benefit from the full advantages of a CDN. We recommend setting <span className="font-mono">www.{formik.values.customDomain}</span> as your primary custom domain.
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}



            {/* Main Content (blurred when dialogOpen) */}
            <div className={`flex flex-col p-4 bg-gray-100 min-h-screen transition-all duration-300 ${dialogOpen ? 'blur-sm pointer-events-none select-none' : ''}`}>
                {/* App Name Header with Status */}
                <div className="flex items-center gap-2 mb-6">
                    <h1 className="text-2xl font-semibold">{appDetails?.name || 'App Configuration'}</h1>
                    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(pods[0]?.status)} ${
                            pods[0]?.status === 'Running' ? 'animate-pulse' : ''
                        }`} />
                        <span className="text-sm font-medium">{pods[0]?.status || 'Unknown'}</span>
                    </div>
                </div>

                {/* Back Button */}
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
                        aria-label="app settings tabs" 
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

                <div className="flex gap-6">
                    {/* Left Sidebar */}
                    <div className="w-64 bg-white rounded-lg shadow-sm p-4 h-fit">
                        <nav>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-4 py-2 rounded-lg mb-2 ${
                                        activeSection === section.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            {/* General Settings Section */}
                            {activeSection === 'general' && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" className="mb-4">General Settings</Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Label>Name</Label>
                                                <Input
                                                    {...formik.getFieldProps('name')}
                                                    error={formik.touched.name && formik.errors.name}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Label>Description</Label>
                                                <Input
                                                    {...formik.getFieldProps('description')}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Label>Build Pack</Label>
                                                <Select
                                                    value={formik.values.buildPack}
                                                    onValueChange={(value) => formik.setFieldValue('buildPack', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="dockerfile">Dockerfile</SelectItem>
                                                        <SelectItem value="buildpacks">Buildpacks</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Label>Port</Label>
                                                <Input
                                                    type="number"
                                                    {...formik.getFieldProps('port')}
                                                    error={formik.touched.port && formik.errors.port}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resources Section */}
                            {activeSection === 'resources' && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" className="mb-4">Resources</Typography>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <div className="space-y-4">
                                                    {/* CPU Row */}
                                                    <div>
                                                        <Label>CPU (cores)</Label>
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Request</span>
                                                                <Input
                                                                    type="text"
                                                                    value={resources.cpuRequest}
                                                                    onChange={e => {
                                                                        setResources(prev => ({ ...prev, cpuRequest: e.target.value }));
                                                                        validateResource('cpu', e.target.value);
                                                                    }}
                                                                    className={resourceError.cpu ? 'border-red-500' : ''}
                                                                />
                                                                {resourceError.cpu && <span className="text-xs text-red-600">{resourceError.cpu}</span>}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Limit</span>
                                                                <Input
                                                                    type="text"
                                                                    value={resources.cpuLimit}
                                                                    onChange={e => setResources(prev => ({ ...prev, cpuLimit: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Memory Row */}
                                                    <div>
                                                        <Label>Memory</Label>
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Request</span>
                                                                <Input
                                                                    type="text"
                                                                    value={resources.memoryRequest}
                                                                    onChange={e => {
                                                                        setResources(prev => ({ ...prev, memoryRequest: e.target.value }));
                                                                        validateResource('memory', e.target.value);
                                                                    }}
                                                                    className={resourceError.memory ? 'border-red-500' : ''}
                                                                />
                                                                {resourceError.memory && <span className="text-xs text-red-600">{resourceError.memory}</span>}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Limit</span>
                                                                <Input
                                                                    type="text"
                                                                    value={resources.memoryLimit}
                                                                    onChange={e => setResources(prev => ({ ...prev, memoryLimit: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Environment Variables Section */}
                            {activeSection === 'env' && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" className="mb-4">Environment Variables</Typography>
                                        <div className="space-y-4">
                                            <Label>ConfigMap Data (Key: Value format)</Label>
                                            {configMapEntries.map((entry, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <Input
                                                        placeholder="KEY"
                                                        value={entry.key}
                                                        onChange={e => {
                                                            const newEntries = [...configMapEntries];
                                                            newEntries[idx].key = e.target.value;
                                                            setConfigMapEntries(newEntries);
                                                        }}
                                                    />
                                                    <Input
                                                        placeholder="Value"
                                                        value={entry.value}
                                                        onChange={e => {
                                                            const newEntries = [...configMapEntries];
                                                            newEntries[idx].value = e.target.value;
                                                            setConfigMapEntries(newEntries);
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setConfigMapEntries(configMapEntries.filter((_, i) => i !== idx))}
                                                        disabled={configMapEntries.length === 1}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setConfigMapEntries([...configMapEntries, { key: '', value: '' }])}
                                                >
                                                    + Add Variable
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowPasteSection(!showPasteSection)}
                                                    className="flex items-center gap-1"
                                                >
                                                    {showPasteSection ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                                    Quick Add from .env Paste
                                                </Button>
                                            </div>
                                            <Typography variant="body2" color="textSecondary">
                                                Enter key-value pairs for your environment variables
                                            </Typography>
                                            {showPasteSection && (
                                                <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <Label>Paste Environment Variables</Label>
                                                    <div className="flex gap-2">
                                                        <textarea
                                                            placeholder="Paste environment variables here (one per line, key=value format):&#10;env=staging&#10;backend_url=http://localhost:4000&#10;gemini_api_key=132i40fkjandfkbabefiandkjfand"
                                                            value={envVarsPasteText}
                                                            onChange={e => setEnvVarsPasteText(e.target.value)}
                                                            className="flex-1 min-h-[100px] p-2 border border-gray-300 rounded-md resize-vertical"
                                                            rows={4}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={parseEnvVars}
                                                            disabled={!envVarsPasteText.trim() || !validateEnvVarFormat(envVarsPasteText)}
                                                            className="self-start"
                                                        >
                                                            Parse & Add
                                                        </Button>
                                                    </div>
                                                    <Typography variant="body2" color="textSecondary" className="text-xs">
                                                        Paste your environment variables in key=value format, one per line. They will be automatically parsed and added to your configuration.
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Domain Mapping Section */}
                            {activeSection === 'domain' && (
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" className="mb-4">Domain Mapping</Typography>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Default Domain</Label>
                                                <Typography variant="body2" color="textSecondary">
                                                    {`${appDetails?.name}-${appDetails?.projectName}-${appDetails?.organizationName}.opslync.io`}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Label>Custom Domain</Label>
                                                {formik.values.customDomain ? (
                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-300 hover:bg-yellow-200 transition"
                                                            onClick={() => setDialogOpen(true)}
                                                        >
                                                            <span className="mr-2">{formik.values.customDomain}</span>
                                                            <span className="bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded-full text-xxs font-bold">Pending</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 items-center mt-2">
                                                        <Input
                                                            placeholder="Enter custom domain (e.g. app.example.com)"
                                                            value={pendingDomain}
                                                            onChange={e => setPendingDomain(e.target.value)}
                                                            error={formik.touched.customDomain && formik.errors.customDomain}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (!pendingDomain) return;
                                                                formik.setFieldValue('customDomain', pendingDomain);
                                                                setPendingDomain("");
                                                            }}
                                                            disabled={!pendingDomain || !!formik.errors.customDomain}
                                                        >
                                                            Add Domain
                                                        </Button>
                                                    </div>
                                                )}
                                                {formik.touched.customDomain && formik.errors.customDomain && (
                                                    <div className="text-red-500 text-sm mt-1">{formik.errors.customDomain}</div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {/* Save Button */}
                            <div className="flex justify-end mt-4">
                                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-400" disabled={isSaving}>
                                    {isSaving ? <CircularProgress size={20} color="inherit" className="mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AppConfigurationPage;
