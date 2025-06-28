import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import githubTokenManager from '../../utils/githubTokenManager';

const GitHubTokenStatus = () => {
  const [status, setStatus] = useState({ isActive: false, appsCount: 0, isInitialized: false });
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const managerStatus = {
        isActive: githubTokenManager.refreshInterval !== null,
        appsCount: githubTokenManager.apps ? githubTokenManager.apps.size : 0,
        isInitialized: githubTokenManager.isInitialized,
        hasApps: githubTokenManager.hasInstalledApps()
      };
      setStatus(managerStatus);
      
      // Show setup prompt for authenticated users with no apps (after some delay)
      const token = localStorage.getItem('token');
      if (token && managerStatus.isInitialized && !managerStatus.hasApps) {
        setTimeout(() => setShowSetupPrompt(true), 10000); // Show after 10 seconds
      } else {
        setShowSetupPrompt(false);
      }
    };

    // Initial check
    checkStatus();

    // Listen to token manager events
    const onInitialized = () => checkStatus();
    const onAppAdded = () => checkStatus();
    const onAppRemoved = () => checkStatus();

    githubTokenManager.addEventListener('initialized', onInitialized);
    githubTokenManager.addEventListener('appAdded', onAppAdded);
    githubTokenManager.addEventListener('appRemoved', onAppRemoved);

    // Check periodically as backup
    const interval = setInterval(checkStatus, 30000);

    return () => {
      clearInterval(interval);
      githubTokenManager.removeEventListener('initialized', onInitialized);
      githubTokenManager.removeEventListener('appAdded', onAppAdded);
      githubTokenManager.removeEventListener('appRemoved', onAppRemoved);
    };
  }, []);

  // Show setup prompt for users with no GitHub apps
  if (showSetupPrompt && !status.hasApps) {
    return (
      <Chip
        icon={<InfoIcon />}
        label="Setup GitHub integration for private repos"
        color="info"
        variant="outlined"
        size="small"
        clickable
        onClick={() => window.location.href = '/settings/git-account'}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
        }}
      />
    );
  }

  // Show active status only when apps exist
  if (!status.isActive || status.appsCount === 0) {
    return null;
  }

  return (
    <Chip
      icon={<RefreshIcon />}
      label={`GitHub tokens auto-refreshing (${status.appsCount} app${status.appsCount > 1 ? 's' : ''})`}
      color="success"
      variant="outlined"
      size="small"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
      }}
    />
  );
};

export default GitHubTokenStatus; 