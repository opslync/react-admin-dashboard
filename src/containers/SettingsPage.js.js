import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { AppBar, Tabs, Tab, Typography, Toolbar, Box } from '@mui/material';

const SettingsPage = () => {
    const history = useHistory();
    const location = useLocation();
    const [tabValue, setTabValue] = useState(0); // Default to "Git Account"

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        const paths = [
            '/settings/git-account',
            // '/settings/host-url',
            '/settings/container-oci-registry',
        ];
        history.push(paths[newValue]);
    };

    useEffect(() => {
        const paths = [
            '/settings/git-account',
            // '/settings/host-url',
            '/settings/container-oci-registry',
        ];
        const activeTab = paths.indexOf(location.pathname);
        setTabValue(activeTab);
    }, [location.pathname]);

    return (
        <div className="flex flex-col lg:ml-64 p-4 bg-gray-100 min-h-screen">
            <AppBar position="static" color="default" className="mb-4">
                <Toolbar>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
                        <Tab label="Git Account" />
                        {/* <Tab label="Host URL" /> */}
                        <Tab label="Container/OCI Registry" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Box p={3}>
                {tabValue === 0 && (
                    <div>
                        <Typography variant="h4" className="mb-6">Git Account</Typography>
                        {/* Add Git Account content here */}
                    </div>
                )}
                {tabValue === 1 && (
                    <div>
                        <Typography variant="h4" className="mb-6">Host URL</Typography>
                        {/* Add Host URL content here */}
                    </div>
                )}
                {tabValue === 2 && (
                    <div>
                        <Typography variant="h4" className="mb-6">Container/OCI Registry</Typography>
                        {/* Add Container/OCI Registry content here */}
                    </div>
                )}
            </Box>
        </div>
    );
};

export default SettingsPage;
