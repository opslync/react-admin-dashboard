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

const validateKeyValuePairs = (value) => {
    if (!value) return false;
    const lines = value.split('\n');
    return lines.every(line => {
        const parts = line.split(':');
        return parts.length === 2 && parts[0].trim() && parts[1].trim();
    });
};

const AppConfigurationPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [appDetails, setAppDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(5);
    const [configMap, setConfigMap] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [activeSection, setActiveSection] = useState('general');
    const [pods, setPods] = useState([]);
    const [resources, setResources] = useState({
        cpu: 0.3,
        memory: 64,
        storage: 25
    });

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
        const statusInterval = setInterval(fetchPodStatus, 10000);

        return () => {
            clearInterval(statusInterval);
        };
    }, [appId]);

    const fetchAppDetails = async () => {
        try {
            const response = await getMethod(`app/${appId}`);
            setAppDetails(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch app details. Please try again.');
            setLoading(false);
        }
    };

    const fetchConfigMap = async () => {
        try {
            const response = await getMethod(`app/${appId}/configmap`);
            const formattedData = Object.entries(response.data)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
            setConfigMap(formattedData || '');
        } catch (err) {
            if (err.response && err.response.data.includes("configmaps") && err.response.data.includes("not found")) {
                setConfigMap('');
            } else {
                setError('Failed to fetch ConfigMap data. Please try again.');
            }
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
            configMapData: configMap,
            domains: appDetails?.domains || [],
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            port: Yup.number().required('Port is required').min(1).max(65535),
            configMapData: Yup.string().test('is-valid', 'Invalid key-value pairs', validateKeyValuePairs),
        }),
        onSubmit: async (values) => {
            try {
                // Update app details
                await putMethod(`app/${appId}`, {
                    name: values.name,
                    description: values.description,
                    buildPack: values.buildPack,
                    repoUrl: values.repoUrl,
                    port: values.port,
                    branch: values.branch,
                    resources: resources
                });

                // Update ConfigMap
                const configMapData = values.configMapData.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split(':').map(part => part.trim());
                    acc[key] = value;
                    return acc;
                }, {});
                await putMethod(`app/${appId}/configmap`, configMapData);

                alert('Settings updated successfully');
            } catch (err) {
                setError('Failed to update settings. Please try again.');
            }
        },
    });

    if (loading) return <CircularProgress />;

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
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
                                                <div>
                                                    <Label>CPU (cores)</Label>
                                                    <div className="flex items-center gap-4">
                                                        <Input
                                                            type="number"
                                                            value={resources.cpu}
                                                            onChange={(e) => setResources(prev => ({...prev, cpu: parseFloat(e.target.value)}))}
                                                            step="0.1"
                                                            min="0.1"
                                                        />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Available: 1.7 cores
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Memory (MB)</Label>
                                                    <div className="flex items-center gap-4">
                                                        <Input
                                                            type="number"
                                                            value={resources.memory}
                                                            onChange={(e) => setResources(prev => ({...prev, memory: parseInt(e.target.value)}))}
                                                            step="32"
                                                            min="32"
                                                        />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Available: 960 MB
                                                        </Typography>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label>Storage (MB)</Label>
                                                    <div className="flex items-center gap-4">
                                                        <Input
                                                            type="number"
                                                            value={resources.storage}
                                                            onChange={(e) => setResources(prev => ({...prev, storage: parseInt(e.target.value)}))}
                                                            step="5"
                                                            min="5"
                                                        />
                                                        <Typography variant="body2" color="textSecondary">
                                                            Available: 999 MB
                                                        </Typography>
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
                                        <Input
                                            as="textarea"
                                            rows={8}
                                            {...formik.getFieldProps('configMapData')}
                                            error={formik.touched.configMapData && formik.errors.configMapData}
                                            className="font-mono"
                                            placeholder="KEY: value&#10;ANOTHER_KEY: another_value"
                                        />
                                        <Typography variant="body2" color="textSecondary">
                                            Enter one key-value pair per line in the format "KEY: value"
                                        </Typography>
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
                                                {`${appDetails?.name}.example.com`}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Label>Custom Domains</Label>
                                            <div className="space-y-2">
                                                {formik.values.domains.map((domain, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Input
                                                            value={domain}
                                                            onChange={(e) => {
                                                                const newDomains = [...formik.values.domains];
                                                                newDomains[index] = e.target.value;
                                                                formik.setFieldValue('domains', newDomains);
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newDomains = formik.values.domains.filter((_, i) => i !== index);
                                                                formik.setFieldValue('domains', newDomains);
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        formik.setFieldValue('domains', [...formik.values.domains, '']);
                                                    }}
                                                >
                                                    Add Domain
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-blue-500 text-white">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AppConfigurationPage;
