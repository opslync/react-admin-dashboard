import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { getMethod, putMethod } from '../library/api';
import { useFormik, FormikProvider, Form } from 'formik';
import * as Yup from 'yup';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    AppBar,
    Tabs,
    Tab,
    Toolbar,
    CircularProgress,
    TextField,
    Button,
    IconButton,
    Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const validateKeyValuePairs = (data) => {
    if (!data) return false;
    const lines = data.split('\n');
    for (let line of lines) {
        if (line.trim() === '') continue; // Skip empty lines
        if (!line.includes(':')) return false;
        const [key, value] = line.split(':').map(part => part.trim());
        if (!key || !value) return false;
    }
    return true;
};

const AppConfigurationPage = () => {
    const { appId } = useParams();
    const history = useHistory();
    const location = useLocation();
    const [appDetails, setAppDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(5); // Default to "App Configuration"
    const [configMap, setConfigMap] = useState('');
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Fetch app details
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

        // Fetch ConfigMap data
        const fetchConfigMap = async () => {
            try {
                const response = await getMethod(`app/${appId}/configmap`);
                const formattedData = Object.entries(response.data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                setConfigMap(formattedData || ''); // Ensure an empty string if data is undefined
            } catch (err) {
                if (err.response && err.response.data.includes("configmaps") && err.response.data.includes("not found")) {
                    setConfigMap(''); // Set configMap to an empty string if not found
                } else {
                    setError('Failed to fetch ConfigMap data. Please try again.');
                }
            }
        };

        fetchAppDetails();
        fetchConfigMap();
    }, [appId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            `/app/${appId}/app-configuration`,
        ];
        history.push(paths[newValue]);
    };

    useEffect(() => {
        const paths = [
            `/app/${appId}/details`,
            `/app/${appId}/build-deploy`,
            `/app/${appId}/build-history`,
            `/app/${appId}/deployment-history`,
            `/app/${appId}/metrics`,
            `/app/${appId}/app-configuration`,
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname, appId]);

    const formik = useFormik({
        initialValues: {
            configMapData: configMap,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            configMapData: Yup.string()
                .required('ConfigMap data is required')
                .test('is-valid', 'Invalid key-value pairs', validateKeyValuePairs),
        }),
        onSubmit: async (values) => {
            try {
                const data = values.configMapData.split('\n').reduce((acc, line) => {
                    const [key, value] = line.split(':').map(part => part.trim());
                    acc[key] = value;
                    return acc;
                }, {});
                console.log("data from endpoint:", data)
                await putMethod(`app/${appId}/configmap`, data);
                alert('ConfigMap updated successfully');
            } catch (err) {
                setError('Failed to update ConfigMap. Please try again.');
            }
        },
    });

    const { errors, touched, handleSubmit, getFieldProps } = formik;

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    if (loading) return <CircularProgress />;
    if (error && error !== 'Failed to fetch ConfigMap data. Please try again.') return <Typography color="error">{error}</Typography>;

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="app detail tabs">
                        <Tab label="App Details" />
                        <Tab label="Build & Deploy" />
                        <Tab label="Build History" />
                        <Tab label="Deployment History" />
                        <Tab label="Metrics" />
                        <Tab label="App Configuration" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Typography variant="h4" className="mb-6">App Configuration</Typography>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Card>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <Typography variant="h6">ConfigMap</Typography>
                                <IconButton onClick={toggleExpand}>
                                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </div>
                            <Collapse in={expanded}>
                                <FormikProvider value={formik}>
                                    <Form onSubmit={handleSubmit}>
                                        <TextField
                                            fullWidth
                                            id="configMapData"
                                            name="configMapData"
                                            label="Key: value"
                                            multiline
                                            rows={6}
                                            variant="outlined"
                                            {...getFieldProps('configMapData')}
                                            error={touched.configMapData && Boolean(errors.configMapData)}
                                            helperText={touched.configMapData && errors.configMapData}
                                        />
                                        <div className="flex justify-end mt-4">
                                            <Button variant="contained" color="primary" type="submit">
                                                Save
                                            </Button>
                                        </div>
                                    </Form>
                                </FormikProvider>
                            </Collapse>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

export default AppConfigurationPage;
