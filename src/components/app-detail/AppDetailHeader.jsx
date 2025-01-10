import React from 'react';
import { AppBar, Tabs, Tab, Toolbar, Box } from '@mui/material';

const AppDetailHeader = ({ appId, currentTab }) => {
    const tabs = [
        { label: 'App Details', path: `/app/${appId}/details` },
        { label: 'Build & Deploy', path: `/app/${appId}/build-deploy` },
        { label: 'Deployment History', path: `/app/${appId}/deployment-history` },
        { label: 'Metrics', path: `/app/${appId}/metrics` },
        { label: 'App Configuration', path: `/app/${appId}/app-configuration` },
    ];

    return (
        <AppBar
            position="static"
            color="default"
            sx={{
                boxShadow: 1,
                backgroundColor: 'background.paper'
            }}
        >
            <Toolbar>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                    <Tabs
                        value={currentTab}
                        aria-label="app detail tabs"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {tabs.map((tab, index) => (
                            <Tab key={tab.path} label={tab.label} />
                        ))}
                    </Tabs>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppDetailHeader;