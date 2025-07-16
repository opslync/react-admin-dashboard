import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CircularProgress } from '@mui/material';
import { postMethod } from '../../library/api';

const GitHubCallback = () => {
  const history = useHistory();
  const location = useLocation();
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    // Add a timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      console.warn('GitHub callback timeout - redirecting to git-account');
      history.push('/settings/git-account?error=Callback timeout');
    }, 30000); // 30 seconds timeout

    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const params = {
        code: searchParams.get('code') || undefined,
        state: searchParams.get('state') || undefined,
        error: searchParams.get('error') || undefined,
        error_description: searchParams.get('error_description') || undefined,
        installation_id: searchParams.get('installation_id') || undefined,
        setup_action: searchParams.get('setup_action') || undefined
      };

      console.log('GitHub callback params:', params);
      console.log('Full URL:', window.location.href);

      // Handle GitHub app installation redirect
      if (params.installation_id) {
        console.log('GitHub app installation detected');
        clearTimeout(timeoutId); // Clear timeout since we're handling the redirect
        if (params.state) {
          try {
            const redirectUrl = decodeURIComponent(params.state);
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
            return;
          } catch (error) {
            console.error('Error decoding state parameter:', error);
            // Fallback to git-account page
            setTimeout(() => history.push('/settings/git-account?installation_success=true'), 2000);
            return;
          }
        } else {
          // No state parameter, redirect to git-account
          console.log('No state parameter, redirecting to git-account');
          setTimeout(() => history.push('/settings/git-account?installation_success=true'), 2000);
          return;
        }
      }

      // Handle GitHub app creation redirect
      if (params.error) {
        console.error('GitHub error:', params.error, params.error_description);
        clearTimeout(timeoutId);
        setStatus('error');
        setTimeout(() => history.push('/settings/git-account?error=' + encodeURIComponent(params.error_description || params.error)), 3000);
        return;
      }

      if (!params.code) {
        console.error('No code parameter received');
        clearTimeout(timeoutId);
        setStatus('error');
        setTimeout(() => history.push('/settings/git-account?error=No authorization code received'), 3000);
        return;
      }

      try {
        console.log('Making GitHub setup request with params:', { code: params.code, state: params.state });
        const response = await postMethod('user/github-setup', {
          code: params.code,
          state: params.state,
        });

        clearTimeout(timeoutId); // Clear timeout since we got a response

        console.log('GitHub setup response:', response);
        console.log('Response data structure:', {
          success: response.data?.success,
          data: response.data?.data,
          app_id: response.data?.data?.app_id,
          id: response.data?.data?.id,
          appId: response.data?.data?.appId
        });
        console.log('Full response.data:', response.data);
        console.log('Full response.data.data:', response.data?.data);

        if (response.status === 200 || response.status === 201) {
          const result = response.data;
          setStatus('success');
          
          // Try different possible app_id field names
          const appId = result.data?.app_id || result.data?.id || result.data?.appId || result.app_id || result.id || result.appId;
          
          console.log('Extracted appId:', appId);
          console.log('Result structure:', {
            result,
            resultData: result.data,
            possibleAppIds: {
              'result.data.app_id': result.data?.app_id,
              'result.data.id': result.data?.id,
              'result.data.appId': result.data?.appId,
              'result.app_id': result.app_id,
              'result.id': result.id,
              'result.appId': result.appId
            }
          });
          
          if (result.success && result.data && appId) {
            console.log('Redirecting to GitHub app details with appId:', appId);
            setTimeout(() => history.push(`/settings/github-app/${appId}`), 2000);
          } else {
            console.log('No app_id found in response, redirecting to git-account with success flag');
            // Redirect to git-account with a success parameter so the page can show a success message
            setTimeout(() => history.push('/settings/git-account?app_created=true'), 2000);
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Setup error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          headers: error.response?.headers
        });
        setStatus('error');
        setTimeout(() => history.push('/settings/git-account?error=' + encodeURIComponent(error.message)), 3000);
      }
    };

    handleCallback();

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [location, history]);

  const handleManualRedirect = () => {
    history.push('/settings/git-account');
  };

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
            <div className="mt-4">
              <button
                onClick={handleManualRedirect}
                className="text-sm text-indigo-600 hover:text-indigo-500 underline"
              >
                Click here if you're stuck
              </button>
            </div>
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
            <div className="mt-4">
              <button
                onClick={handleManualRedirect}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Go to Git Account Settings
              </button>
            </div>
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
            <div className="mt-4">
              <button
                onClick={handleManualRedirect}
                className="text-sm text-indigo-600 hover:text-indigo-500 underline"
              >
                Click here if redirect doesn't work
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;