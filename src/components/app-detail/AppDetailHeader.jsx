import React from 'react';
import { AppBar, Tabs, Tab, Toolbar, Box } from '@mui/material';

const TABS = [
    { label: 'App Details', path: 'details' },
    { label: 'Build & Deploy', path: 'build-deploy' },
    { label: 'Build History', path: 'build-history' },
    { label: 'Deployment History', path: 'deployment-history' },
    { label: 'Metrics', path: 'metrics' },
    { label: 'App Configuration', path: 'app-configuration' },
];

export const AppDetailHeader = ({ tabValue, onTabChange }) => (
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
                    value={tabValue}
                    onChange={onTabChange}
                    aria-label="app detail tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {TABS.map((tab, index) => (
                        <Tab key={tab.path} label={tab.label} />
                    ))}
                </Tabs>
            </Box>
        </Toolbar>
    </AppBar>
);