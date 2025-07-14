import React from 'react';
import { useHistory } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import { GITHUB_APP_CREATION_URL, GITHUB_STATE_PARAM } from '../../config/github.config';
import { createGitHubManifest } from '../../utils/github.utils';

const GitHubAppRegistration = ({ onSuccess }) => {
  const history = useHistory();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const manifest = createGitHubManifest();
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${GITHUB_APP_CREATION_URL}?state=${GITHUB_STATE_PARAM}`;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'manifest';
    input.value = JSON.stringify(manifest);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-gray-700">
            <GitHubIcon className="w-full h-full" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create GitHub App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your GitHub App with the specified manifest
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleFormSubmit}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <GitHubIcon className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
            </span>
            Set up GitHub App
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubAppRegistration;

