import React, { useState, useEffect } from 'react';
import { X, Play, GitCommit } from 'lucide-react';
import { postMethod, getMethod } from '../../library/api';
import { useParams } from 'react-router-dom';
import githubTokenManager from '../../utils/githubTokenManager';

export default function BuildModal({ onClose, onStartBuild }) {
  const { appId } = useParams();
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  const [isStartingBuild, setIsStartingBuild] = useState(false);

  useEffect(() => {
    fetchAppDetails();
  }, [appId]);

  const fetchAppDetails = async () => {
    try {
      const response = await getMethod(`app/${appId}`);
      setAppDetails(response.data);
      fetchCommits(response.data);
    } catch (err) {
      setError('Failed to fetch app details');
      setLoading(false);
    }
  };

  const fetchCommits = async (appData) => {
    try {
      // Wait for GitHub token to be available
      const githubToken = await githubTokenManager.waitForToken(5000);
      if (!githubToken) {
        setError('GitHub token not available. Please setup GitHub integration in Settings.');
        setLoading(false);
        return;
      }

      const repoUrl = appData.repoUrl.replace(/\.git$/, '');

      const payload = {
        github_token: githubToken,
        repo_url: repoUrl,
        branch: appData.branch || 'main'
      };

      const response = await postMethod('user/github/commits', payload);
      setCommits(response.data);
      setSelectedCommit(response.data[0]);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch commits. Please check your GitHub integration.');
      setLoading(false);
    }
  };

  const handleStartBuild = async () => {
    if (!selectedCommit || !appDetails) return;

    setIsStartingBuild(true);
    try {
      const buildPayload = {
        pipeline_id: "456", // This should come from your pipeline configuration
        commit_id: selectedCommit.hash,
        commit_message: selectedCommit.message,
        params: {
          "repo-url": appDetails.repoUrl,
          "branch": appDetails.branch || 'main',
          "commit": selectedCommit.hash,
          "dockerfile-path": "Dockerfile",
          "image-name": `opslync/${appDetails.name}`,
          "image-tag": selectedCommit.hash
        }
      };

      const response = await postMethod(`app/${appId}/workflows/build/start`, buildPayload);
      onClose();
      if (onStartBuild && response.data?.workflowID) {
        onStartBuild(selectedCommit, response.data.workflowID);
      }
    } catch (err) {
      setError('Failed to start build. Please try again.');
    } finally {
      setIsStartingBuild(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-600">Loading commits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!appDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600 mb-4">Failed to load app details</p>
          <button
            onClick={onClose}
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const displayRepoUrl = appDetails.repoUrl.replace(/\.git$/, '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-[600px]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Start New Build</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Select a commit from{' '}
            <a 
              href={displayRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {displayRepoUrl}
            </a>{' '}
            ({appDetails.branch || 'main'})
          </h3>
          <div className="space-y-2">
            {commits.map((commit) => (
              <div
                key={commit.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCommit?.id === commit.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedCommit(commit)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <GitCommit className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{commit.message}</p>
                      <p className="text-sm text-gray-500">
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{commit.hash}</code> • {commit.author} • {commit.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected commit: <code className="bg-gray-100 px-1 py-0.5 rounded">{selectedCommit?.hash}</code>
          </div>
          <button
            onClick={handleStartBuild}
            disabled={isStartingBuild || !selectedCommit}
            className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              isStartingBuild || !selectedCommit
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isStartingBuild ? 'Starting Build...' : 'Start Build'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}