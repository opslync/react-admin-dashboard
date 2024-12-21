import React, { useState, useEffect } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import { API_BASE_URL } from '../../config/github.config';

const InstallGitHubApp = () => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInstallations();
  }, []);

  const fetchInstallations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/github/installations`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInstallations(data);
      }
    } catch (error) {
      console.error('Error fetching installations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = () => {
    // Redirect to GitHub app installation page
    window.location.href = 'https://github.com/apps/amitoo73/installations/new';
  };

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

        {loading ? (
          <div className="text-center">Loading installations...</div>
        ) : installations.length > 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Installations</h3>
            <ul className="space-y-3">
              {installations.map((installation) => (
                <li key={installation.id} className="flex items-center justify-between">
                  <span>{installation.account.login}</span>
                  <span className="text-sm text-green-600">Installed</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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