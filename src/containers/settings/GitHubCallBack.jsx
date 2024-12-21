import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../../config/github.config';

const GitHubCallback = () => {
  const history = useHistory();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const params = {
        code: searchParams.get('code') || undefined,
        state: searchParams.get('state') || undefined,
        error: searchParams.get('error') || undefined,
        error_description: searchParams.get('error_description') || undefined,
        installation_id: searchParams.get('installation_id') || undefined
      };

      if (params.installation_id) {
        if (params.state) {
          window.location.href = decodeURIComponent(params.state);
          window.location.reload();
          return;
        }
      }

      if (params.error || !params.code) {
        setStatus('error');
        setTimeout(() => history.push('/'), 3000);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/github-setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: params.code,
            state: params.state,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete setup');
        }

        const result = await response.json();
        setStatus('success');
        
        if (result.success && result.data && result.data.app_id) {
          setTimeout(() => history.push(`/settings/github-app/${result.data.app_id}`), 2000);
        } else {
          setTimeout(() => history.push('/settings/git-account'), 2000);
        }
      } catch (error) {
        console.error('Setup error:', error);
        setStatus('error');
        setTimeout(() => history.push('/'), 3000);
      }
    };

    handleCallback();
  }, [location, history]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-4">
        {status === 'loading' ? (
          <>
            <CircularProgress className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">
              Setting up GitHub App
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the setup...
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <CancelIcon className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              GitHub App Setup Failed
            </h2>
            <p className="text-gray-600">
              {new URLSearchParams(location.search).get('error_description') || 'An error occurred during setup'}
            </p>
          </>
        ) : (
          <>
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              GitHub App Setup Successful
            </h2>
            <p className="text-gray-600">
              Redirecting to app details...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;