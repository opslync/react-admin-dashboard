import React, { useState, useEffect } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import { API_BASE_URL } from '../../config/github.config';

const InstallGitHubApp = ({ appId }) => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  const fetchAppDetails = async () => {
    try {
      const result = await getMethod(`user/github/apps/${appId}`);
      if (result.success && result.data) {
        setApp(result.data);
      }
    } catch (error) {
      console.error('Error fetching app details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = () => {
    if (app && app.name) {
      window.location.href = `https://github.com/apps/${app.name}/installations/new`;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!app) return <div>App not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-gray-700">
            <GitHubIcon className="w-full h-full" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Install GitHub App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Install the app to your GitHub account to start using it
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          <span className="absolute left-0 inset-y-0 flex items-center pl-3">
            <GitHubIcon className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
          </span>
          Install GitHub App
        </button>
      </div>
    </div>
  );
};

export default InstallGitHubApp; 